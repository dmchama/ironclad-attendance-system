
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2, User, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GymAdminAuthProps {
  onAuthSuccess: (gymId: string, gymName: string) => void;
  onBack: () => void;
}

const GymAdminAuth = ({ onAuthSuccess, onBack }: GymAdminAuthProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('authenticate_gym_admin', {
          input_username: formData.username,
          input_password: formData.password
        });

      if (error) throw error;

      if (data && data.length > 0 && data[0].is_authenticated) {
        toast({
          title: "Success",
          description: `Welcome to ${data[0].gym_name}!`
        });
        onAuthSuccess(data[0].gym_id, data[0].gym_name);
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gym Admin Login
          </CardTitle>
          <p className="text-gray-600">
            Enter your credentials to manage your gym
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
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
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={onBack}
              className="text-sm"
            >
              ← Back to login options
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymAdminAuth;
