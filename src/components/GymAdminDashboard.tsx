
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Calendar, DollarSign, LogOut, QrCode, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGymStore } from '@/store/gymStore';
import UserManagement from './UserManagement';
import AttendanceManagement from './AttendanceManagement';
import PaymentManagement from './PaymentManagement';
import GymProfile from './GymProfile';

interface GymAdminDashboardProps {
  gymId: string;
  gymName: string;
  onLogout: () => void;
}

const GymAdminDashboard = ({ gymId, gymName, onLogout }: GymAdminDashboardProps) => {
  const { toast } = useToast();
  const { 
    users, 
    attendance, 
    payments, 
    currentGym,
    fetchUsers, 
    fetchAttendance, 
    fetchPayments,
    fetchCurrentGym 
  } = useGymStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [gymId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCurrentGym(gymId),
        fetchUsers(gymId),
        fetchAttendance(gymId),
        fetchPayments(gymId)
      ]);
    } catch (error: any) {
      console.error('Error loading gym data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard stats
  const totalMembers = users.length;
  const activeMembers = users.filter(u => u.status === 'active').length;
  const todaysAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid' && new Date(p.paidDate || '').getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{gymName}</h1>
              <p className="text-gray-600">Gym Admin Dashboard</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Profile & QR
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Gym Profile Tab */}
          <TabsContent value="profile">
            <GymProfile />
          </TabsContent>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Members</p>
                      <p className="text-3xl font-bold">{totalMembers}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Members</p>
                      <p className="text-3xl font-bold">{activeMembers}</p>
                    </div>
                    <Users className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Today's Check-ins</p>
                      <p className="text-3xl font-bold">{todaysAttendance}</p>
                    </div>
                    <Clock className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Monthly Revenue</p>
                      <p className="text-3xl font-bold">${monthlyRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-10 w-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{record.userName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString()} at {record.checkIn}
                          </p>
                        </div>
                        <Badge variant="outline">Check-in</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingPayments > 0 ? (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="font-medium text-yellow-800">
                          {pendingPayments} Pending Payment{pendingPayments > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-yellow-600">
                          Review payment status in the Payments tab
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="font-medium text-green-800">All Payments Up to Date</p>
                        <p className="text-sm text-green-600">No pending payments</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <UserManagement gymId={gymId} />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <AttendanceManagement gymId={gymId} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentManagement gymId={gymId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
