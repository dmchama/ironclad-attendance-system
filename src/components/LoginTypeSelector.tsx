
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User, Shield } from 'lucide-react';

interface LoginTypeSelectorProps {
  onSelectType: (type: 'admin' | 'member' | 'super_admin') => void;
}

const LoginTypeSelector = ({ onSelectType }: LoginTypeSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FitTrack Pro
          </CardTitle>
          <p className="text-gray-600">
            Choose your login type
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => onSelectType('super_admin')}
            className="w-full h-16 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 flex items-center justify-center gap-3"
          >
            <Shield className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Super Admin</div>
              <div className="text-sm opacity-90">Manage all gyms</div>
            </div>
          </Button>

          <Button
            onClick={() => onSelectType('admin')}
            className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-3"
          >
            <Building2 className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Gym Admin</div>
              <div className="text-sm opacity-90">Manage your gym</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onSelectType('member')}
            className="w-full h-16 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center justify-center gap-3"
          >
            <User className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Gym Member</div>
              <div className="text-sm opacity-90">Check-in to gym</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginTypeSelector;
