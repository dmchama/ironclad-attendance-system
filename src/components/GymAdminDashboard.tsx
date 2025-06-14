import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Users, UserCheck, DollarSign, LogOut, CreditCard } from 'lucide-react';
import { useGymStore } from '@/store/gymStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Dashboard from './Dashboard';
import GymProfile from './GymProfile';
import UserManagement from './UserManagement';
import AttendanceManagement from './AttendanceManagement';
import PaymentManagement from './PaymentManagement';
import MembershipPlans from './MembershipPlans';

interface GymAdminDashboardProps {
  gymId?: string;
  gymName?: string;
  onLogout?: () => void;
}

const GymAdminDashboard = ({ onLogout }: GymAdminDashboardProps) => {
  const { currentGym } = useGymStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gymData, setGymData] = useState<{ gymId: string; gymName: string } | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('gymAdmin');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setGymData(parsedData);
      } catch (error) {
        console.error('Error parsing gym data from localStorage:', error);
        localStorage.removeItem('gymAdmin');
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('gymAdmin');
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Gym Profile', icon: Building2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'membership-plans', label: 'Membership Plans', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: DollarSign },
  ];

  const renderContent = () => {
    if (!gymData?.gymId) return <div>Loading...</div>;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <GymProfile />;
      case 'members':
        return <UserManagement gymId={gymData.gymId} />;
      case 'membership-plans':
        return <MembershipPlans gymId={gymData.gymId} />;
      case 'attendance':
        return <AttendanceManagement gymId={gymData.gymId} />;
      case 'payments':
        return <PaymentManagement gymId={gymData.gymId} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white flex flex-col border-r">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-lg font-semibold">{gymData?.gymName || 'Gym Admin'}</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="mb-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === item.id ? 'text-blue-600' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardContent className="h-full">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
