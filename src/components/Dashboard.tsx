
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, TrendingUp, UserPlus, Clock } from "lucide-react";
import { useGymStore } from "@/store/gymStore";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard = ({ setActiveTab }: DashboardProps) => {
  const { users, attendance, payments } = useGymStore();
  
  const totalMembers = users.length;
  const activeMembers = users.filter(user => user.status === 'active').length;
  const todayAttendance = attendance.filter(
    record => new Date(record.date).toDateString() === new Date().toDateString()
  ).length;
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
  const totalRevenue = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      onClick: () => setActiveTab("users")
    },
    {
      title: "Active Members",
      value: activeMembers,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      onClick: () => setActiveTab("users")
    },
    {
      title: "Today's Attendance",
      value: todayAttendance,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      onClick: () => setActiveTab("attendance")
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      onClick: () => setActiveTab("payments")
    }
  ];

  const quickActions = [
    {
      title: "Add New Member",
      description: "Register a new gym member",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      onClick: () => setActiveTab("users")
    },
    {
      title: "Mark Attendance",
      description: "Check-in members for today",
      icon: Clock,
      color: "from-green-500 to-green-600",
      onClick: () => setActiveTab("attendance")
    },
    {
      title: "Process Payment",
      description: "Record monthly payments",
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      onClick: () => setActiveTab("payments")
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${totalRevenue.toLocaleString()}</p>
          <p className="text-green-100 mt-2">From completed payments</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={action.onClick}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
