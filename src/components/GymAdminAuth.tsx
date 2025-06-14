
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGymStore } from '@/store/gymStore';

interface GymAdminAuthProps {
  onAuthSuccess: (gymId: string, gymName: string) => void;
  onBack: () => void;
}

const GymAdminAuth = ({ onAuthSuccess, onBack }: GymAdminAuthProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { authenticateGymAdmin } = useGymStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting gym admin authentication for:', username);
      
      const result = await authenticateGymAdmin(username.trim(), password);
      
      if (result) {
        console.log('Gym admin authentication successful:', result);
        
        // Store gym admin data in localStorage for persistence
        localStorage.setItem('gymAdmin', JSON.stringify({
          gymId: result.gymId,
          gymName: result.gymName,
          loginTime: new Date().toISOString()
        }));
        
        toast({
          title: "Success",
          description: `Welcome to ${result.gymName}!`
        });
        
        onAuthSuccess(result.gymId, result.gymName);
      } else {
        console.log('Gym admin authentication failed - invalid credentials');
        toast({
          title: "Authentication Failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Gym admin authentication error:', error);
      toast({
        title: "Error",
        description: "An error occurred during authentication. Please try again.",
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
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Gym Admin Login</CardTitle>
          <p className="text-gray-600">Sign in to manage your gym</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login Options
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymAdminAuth;
