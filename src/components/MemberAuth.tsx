import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, Clock, CheckCircle, User } from 'lucide-react';
import { useGymStore } from '@/store/gymStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MemberAuth = () => {
  const { users, fetchUsers, addAttendance } = useGymStore();
  const { toast } = useToast();
  const [memberEmail, setMemberEmail] = useState('');
  const [gymQrCode, setGymQrCode] = useState('');
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [gymInfo, setGymInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleMemberLogin = async () => {
    if (!memberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Find member by email across all gyms
      const { data: memberData, error } = await supabase
        .from('members')
        .select(`
          *,
          gyms (
            id,
            name,
            gym_qr_code
          )
        `)
        .eq('email', memberEmail.toLowerCase().trim())
        .eq('status', 'active')
        .single();

      if (error || !memberData) {
        toast({
          title: "Member Not Found",
          description: "No active membership found with this email address",
          variant: "destructive"
        });
        return;
      }

      setCurrentMember(memberData);
      setGymInfo(memberData.gyms);
      setGymQrCode(memberData.gyms.gym_qr_code);
      
      toast({
        title: "Welcome!",
        description: `Hello ${memberData.name}, you can now check in at ${memberData.gyms.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to find member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentMember || !gymInfo) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

      // Check if member already checked in today
      const { data: existingAttendance, error: checkError } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', currentMember.id)
        .eq('date', today)
        .eq('gym_id', gymInfo.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAttendance && !existingAttendance.check_out) {
        // Member is checking out
        const checkInTime = new Date(`${today}T${existingAttendance.check_in}`);
        const checkOutTime = new Date(`${today}T${currentTime}`);
        const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)); // in minutes

        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            check_out: currentTime,
            duration: duration
          })
          .eq('id', existingAttendance.id);

        if (updateError) throw updateError;

        toast({
          title: "Checked Out!",
          description: `Thank you ${currentMember.name}! You worked out for ${duration} minutes today.`,
        });
        
        setCheckedIn(false);
      } else if (existingAttendance && existingAttendance.check_out) {
        toast({
          title: "Already Completed",
          description: "You have already completed your workout for today!",
          variant: "destructive"
        });
      } else {
        // Member is checking in
        const { error: insertError } = await supabase
          .from('attendance')
          .insert({
            member_id: currentMember.id,
            gym_id: gymInfo.id,
            date: today,
            check_in: currentTime
          });

        if (insertError) throw insertError;

        toast({
          title: "Checked In!",
          description: `Welcome to ${gymInfo.name}, ${currentMember.name}! Have a great workout!`,
        });
        
        setCheckedIn(true);
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
    toast({
      title: "QR Scanner",
      description: "QR code scanner would open here. For now, the gym QR code is auto-filled.",
    });
  };

  const resetSession = () => {
    setCurrentMember(null);
    setGymInfo(null);
    setMemberEmail('');
    setGymQrCode('');
    setCheckedIn(false);
  };

  if (!currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Member Check-In</CardTitle>
            <p className="text-gray-600">
              Enter your email to access gym check-in
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Member Email</Label>
              <Input
                id="email"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Enter your registered email"
                onKeyPress={(e) => e.key === 'Enter' && handleMemberLogin()}
              />
            </div>
            <Button
              onClick={handleMemberLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {loading ? 'Finding Member...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            {checkedIn ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <QrCode className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            Welcome, {currentMember.name}!
          </CardTitle>
          <p className="text-gray-600">
            {gymInfo.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Gym QR Code</p>
            <p className="font-mono text-lg font-bold text-blue-600">{gymQrCode}</p>
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
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Clock className="w-4 h-4 mr-2" />
              {checkedIn ? 'Check Out' : 'Check In'}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Membership: {currentMember.membership_type.toUpperCase()}
            </p>
            <Button
              onClick={resetSession}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Switch Member
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberAuth;
