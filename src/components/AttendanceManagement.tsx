
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, LogIn, LogOut, Calendar, Scan } from "lucide-react";
import { useGymStore } from "@/store/gymStore";
import { useToast } from "@/hooks/use-toast";
import BarcodeScanner from "./BarcodeScanner";

interface AttendanceManagementProps {
  gymId: string;
}

const AttendanceManagement = ({ gymId }: AttendanceManagementProps) => {
  const { users, attendance, addAttendance, updateAttendance } = useGymStore();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const handleCheckIn = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a member",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === selectedUser);
    if (!user) return;

    // Check if user is already checked in today
    const todayRecord = attendance.find(
      record => 
        record.userId === selectedUser && 
        record.date === new Date().toISOString().split('T')[0] &&
        !record.checkOut
    );

    if (todayRecord) {
      toast({
        title: "Error",
        description: "Member is already checked in",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);

    try {
      await addAttendance({
        userId: selectedUser,
        userName: user.name,
        date: new Date().toISOString().split('T')[0],
        checkIn: timeString,
        gymId
      });

      toast({
        title: "Success",
        description: `${user.name} checked in at ${timeString}`
      });
      setSelectedUser("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in member",
        variant: "destructive"
      });
    }
  };

  const handleCheckOut = async (recordId: string) => {
    const record = attendance.find(r => r.id === recordId);
    if (!record || record.checkOut) return;

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const checkInTime = new Date(`2000-01-01T${record.checkIn}:00`);
    const checkOutTime = new Date(`2000-01-01T${timeString}:00`);
    const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));

    try {
      await updateAttendance(recordId, {
        checkOut: timeString,
        duration
      });

      toast({
        title: "Success",
        description: `${record.userName} checked out at ${timeString}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check out member",
        variant: "destructive"
      });
    }
  };

  const filteredAttendance = attendance.filter(record => record.date === dateFilter);
  const todayAttendance = attendance.filter(
    record => record.date === new Date().toISOString().split('T')[0]
  );
  const activeCheckins = todayAttendance.filter(record => !record.checkOut);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h2>
        <p className="text-gray-600">Track member check-ins and check-outs</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Today's Check-ins</p>
                <p className="text-2xl font-bold">{todayAttendance.length}</p>
              </div>
              <LogIn className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Currently In Gym</p>
                <p className="text-2xl font-bold">{activeCheckins.length}</p>
              </div>
              <CheckCircle className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Avg. Daily Visits</p>
                <p className="text-2xl font-bold">
                  {Math.round(attendance.length / Math.max(1, new Set(attendance.map(r => r.date)).size))}
                </p>
              </div>
              <Calendar className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Tabs */}
      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Barcode Scanner
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Manual Check-in
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <BarcodeScanner />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          {/* Manual Check-in Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Manual Member Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Select Member</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a member to check in" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => user.status === 'active')
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} - {user.membershipType}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCheckIn}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Currently In Gym */}
      {activeCheckins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Currently In Gym
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCheckins.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-semibold">{record.userName}</p>
                    <p className="text-sm text-gray-600">Checked in: {record.checkIn}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCheckOut(record.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Check Out
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance History
            </CardTitle>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length > 0 ? (
            <div className="space-y-3">
              {filteredAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{record.userName}</p>
                      <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-green-600">In: {record.checkIn}</span>
                      {record.checkOut && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-red-600">Out: {record.checkOut}</span>
                        </>
                      )}
                    </div>
                    {record.duration && (
                      <Badge variant="outline">
                        {Math.floor(record.duration / 60)}h {record.duration % 60}m
                      </Badge>
                    )}
                    {!record.checkOut && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No attendance records for {new Date(dateFilter).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
