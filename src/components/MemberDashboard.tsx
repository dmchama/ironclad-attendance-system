
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, User, Clock, CheckCircle, LogOut, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRScannerComponent from './QRScanner';

interface MemberDashboardProps {
  memberId: string;
  memberName: string;
  gymId: string;
  onLogout: () => void;
}

const MemberDashboard = ({ memberId, memberName, gymId, onLogout }: MemberDashboardProps) => {
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastActivity, setLastActivity] = useState<{
    success: boolean;
    message: string;
    gymName: string;
    time: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    await processQRCode(qrCode.trim());
  };

  const processQRCode = async (qrCodeValue: string) => {
    setScanning(true);
    try {
      const { data, error } = await supabase
        .rpc('member_checkin_with_qr', {
          member_id: memberId,
          gym_qr_code: qrCodeValue
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);

        setLastActivity({
          success: result.success,
          message: result.message,
          gymName: result.gym_name,
          time: timeString
        });

        if (result.success) {
          toast({
            title: "Success",
            description: result.message
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process QR code",
        variant: "destructive"
      });
    } finally {
      setQrCode('');
      setScanning(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleScanSuccess = (result: string) => {
    setShowScanner(false);
    setQrCode(result);
    processQRCode(result);
  };

  const handleManualEntry = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome, {memberName}!</h1>
              <p className="text-gray-600">Member Dashboard</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <QrCode className="h-8 w-8 text-green-600" />
                Gym QR Code Scanner
              </CardTitle>
              <p className="text-gray-600">Scan your gym's QR code to mark attendance</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleQRSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Scan gym QR code or enter manually..."
                    className="text-center text-lg py-6 border-2 border-green-200 focus:border-green-400"
                    disabled={scanning}
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <QrCode className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="flex-1"
                    disabled={scanning}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Scan with Camera
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    disabled={scanning || !qrCode.trim()}
                  >
                    {scanning ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check In/Out
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-gray-600 bg-white p-3 rounded-lg">
                <p><strong>How to use:</strong></p>
                <p>1. Click "Scan with Camera" to use your device camera</p>
                <p>2. Point camera at the gym's QR code</p>
                <p>3. Or manually enter the QR code in the field above</p>
                <p>4. Your attendance will be marked automatically</p>
              </div>
            </CardContent>
          </Card>

          {/* Last Activity Display */}
          {lastActivity && (
            <Card className={`${lastActivity.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} transition-all duration-500`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${lastActivity.success ? 'bg-green-100' : 'bg-red-100'}`}>
                      {lastActivity.success ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <User className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Last Activity</h3>
                      <p className="text-sm text-gray-600">{lastActivity.message}</p>
                      {lastActivity.gymName && (
                        <p className="text-sm text-gray-500">Gym: {lastActivity.gymName}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${lastActivity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-lg px-4 py-2`}>
                      {lastActivity.success ? 'SUCCESS' : 'FAILED'}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Time: {lastActivity.time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name:</p>
                  <p className="text-lg font-semibold">{memberName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Member ID:</p>
                  <p className="text-sm font-mono text-gray-600">{memberId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerComponent
        isOpen={showScanner}
        onScanSuccess={handleScanSuccess}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default MemberDashboard;
