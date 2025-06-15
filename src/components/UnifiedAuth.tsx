
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedAuthProps {
  onAuthSuccess: (authData: {
    userType: string;
    userId?: string;
    userName?: string;
    gymId?: string;
    gymName?: string;
  }) => void;
}

const UnifiedAuth = ({ onAuthSuccess }: UnifiedAuthProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: ''
  });
  const { toast } = useToast();

  const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    let authenticated = false;

    // 1. Try to sign in as Super Admin if identifier is an email
    if (isEmail(formData.identifier)) {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: formData.identifier,
        password: formData.password
      });

      if (authData.user) {
        const { data: adminData } = await supabase
          .from('super_admin_roles')
          .select('user_id')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (adminData) {
          toast({ title: "Welcome Super Admin!" });
          // onAuthStateChange in Index.tsx will handle the state update and redirect.
          authenticated = true;
          setLoading(false);
          return;
        } else {
            // User is signed in but not a super admin, sign them out.
            await supabase.auth.signOut();
        }
      }
    }

    // 2. Try to authenticate as Gym Admin or Member
    if (!authenticated) {
        try {
            const { data, error } = await supabase
              .rpc('authenticate_user', {
                p_username: formData.identifier,
                p_password: formData.password
              });

            if (error) throw error;
      
            if (data && data.length > 0) {
              const result = data[0];
              if(result.is_authenticated) {
                toast({
                  title: "Success",
                  description: `Welcome back, ${result.user_name}!`
                });
                onAuthSuccess({
                    userType: result.user_type,
                    userId: result.user_id,
                    userName: result.user_name,
                    gymId: result.gym_id,
                    gymName: result.gym_name,
                });
                authenticated = true;
              }
            }
        } catch(error: any) {
            console.error("Non-super-admin auth error:", error.message);
        }
    }

    if (!authenticated) {
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials. Please check your username/email and password.",
          variant: "destructive"
        });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FitTrack Pro
          </CardTitle>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identifier" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Email or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="Enter your email or username"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
                className="mt-1"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedAuth;
