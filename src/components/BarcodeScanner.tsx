
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scan, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useGymStore } from '@/store/gymStore';
import { useToast } from '@/hooks/use-toast';

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScannedMember, setLastScannedMember] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { users, attendance, addAttendance, updateAttendance } = useGymStore();
  const { toast } = useToast();

  useEffect(() => {
    // Auto-focus the input for barcode scanning
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setScanning(true);
    try {
      // Find member by barcode
      const member = users.find(user => user.barcode === barcode.trim());
      
      if (!member) {
        toast({
          title: "Member not found",
          description: "No member found with this barcode",
          variant: "destructive"
        });
        setBarcode('');
        setScanning(false);
        return;
      }

      if (member.status !== 'active') {
        toast({
          title: "Access denied",
          description: `Member status is ${member.status}`,
          variant: "destructive"
        });
        setBarcode('');
        setScanning(false);
        return;
      }

      // Check if member is already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendance.find(
        record => 
          record.userId === member.id && 
          record.date === today &&
          !record.checkOut
      );

      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);

      if (todayRecord) {
        // Check out
        await updateAttendance(todayRecord.id, {
          checkOut: timeString,
          duration: Math.round((now.getTime() - new Date(`2000-01-01T${todayRecord.checkIn}:00`).getTime()) / (1000 * 60))
        });

        setLastScannedMember({
          ...member,
          action: 'checkout',
          time: timeString
        });

        toast({
          title: "Check-out successful",
          description: `${member.name} checked out at ${timeString}`
        });
      } else {
        // Check in
        await addAttendance({
          userId: member.id,
          userName: member.name,
          date: today,
          checkIn: timeString
        });

        setLastScannedMember({
          ...member,
          action: 'checkin',
          time: timeString
        });

        toast({
          title: "Check-in successful",
          description: `${member.name} checked in at ${timeString}`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBarcode('');
      setScanning(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleManualEntry = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Scan className="h-8 w-8 text-blue-600" />
            Barcode Scanner
          </CardTitle>
          <p className="text-gray-600">Scan member barcode for quick attendance</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleBarcodeSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan barcode or enter manually..."
                className="text-center text-lg py-6 border-2 border-blue-200 focus:border-blue-400"
                disabled={scanning}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Scan className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={scanning || !barcode.trim()}
              >
                {scanning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Attendance
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleManualEntry}
                className="px-6"
              >
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Last Scanned Member Display */}
      {lastScannedMember && (
        <Card className={`${lastScannedMember.action === 'checkin' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} transition-all duration-500`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${lastScannedMember.action === 'checkin' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <User className={`h-6 w-6 ${lastScannedMember.action === 'checkin' ? 'text-green-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{lastScannedMember.name}</h3>
                  <p className="text-sm text-gray-600">{lastScannedMember.email}</p>
                  <p className="text-sm text-gray-500">Barcode: {lastScannedMember.barcode}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${lastScannedMember.action === 'checkin' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} text-lg px-4 py-2`}>
                  {lastScannedMember.action === 'checkin' ? 'CHECKED IN' : 'CHECKED OUT'}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  {lastScannedMember.action === 'checkin' ? 'Entry' : 'Exit'} time: {lastScannedMember.time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;
