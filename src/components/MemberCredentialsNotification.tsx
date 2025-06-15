
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Lock, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemberCredentialsNotificationProps {
  memberName: string;
  username: string;
  password: string;
  email: string;
  onClose: () => void;
}

const MemberCredentialsNotification = ({ 
  memberName, 
  username, 
  password, 
  email, 
  onClose 
}: MemberCredentialsNotificationProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const copyAllDetails = () => {
    const details = `Member Login Details:
Name: ${memberName}
Email: ${email}
Username: ${username}
Password: ${password}`;
    
    navigator.clipboard.writeText(details);
    toast({
      title: "All Details Copied!",
      description: "All member details copied to clipboard",
    });
  };

  return (
    <Card className="border-green-200 bg-green-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-800">Member Created Successfully!</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-3">Login Credentials for {memberName}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="font-mono font-semibold">{username}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(username, 'Username')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Password</p>
                    <p className="font-mono font-semibold">{password}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(password, 'Password')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={copyAllDetails} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy All Details
            </Button>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="text-green-700 border-green-300">
              Email with login details has been sent to {email}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCredentialsNotification;
