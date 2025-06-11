
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, Clock, CheckCircle } from 'lucide-react';
import { useGymStore } from '@/store/gymStore';
import { useToast } from '@/hooks/use-toast';

interface MemberCheckInProps {
  memberId: string;
  onCheckInSuccess?: () => void;
}

const MemberCheckIn = ({ memberId, onCheckInSuccess }: MemberCheckInProps) => {
  const { memberCheckInWithQR } = useGymStore();
  const { toast } = useToast();
  const [gymQrCode, setGymQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    if (!gymQrCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter or scan the gym QR code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await memberCheckInWithQR(memberId, gymQrCode);
      if (result.success) {
        setCheckedIn(true);
        toast({
          title: "Success",
          description: result.message
        });
        onCheckInSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    // This would integrate with a QR code scanner component
    toast({
      title: "QR Scanner",
      description: "QR code scanner would open here"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            {checkedIn ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <QrCode className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {checkedIn ? 'Checked In!' : 'Gym Check-In'}
          </CardTitle>
          <p className="text-gray-600">
            {checkedIn 
              ? 'You have successfully checked in to the gym'
              : 'Scan or enter the gym QR code to check in'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!checkedIn && (
            <>
              <div>
                <Label htmlFor="qrcode">Gym QR Code</Label>
                <Input
                  id="qrcode"
                  value={gymQrCode}
                  onChange={(e) => setGymQrCode(e.target.value)}
                  placeholder="Enter gym QR code (e.g., GYM-ABC12345)"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleScanQR}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan QR
                </Button>
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              </div>
            </>
          )}

          {checkedIn && (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium">
                Check-in time: {new Date().toLocaleTimeString()}
              </div>
              <Button
                onClick={() => {
                  setCheckedIn(false);
                  setGymQrCode('');
                }}
                variant="outline"
                className="w-full"
              >
                Check In Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberCheckIn;
