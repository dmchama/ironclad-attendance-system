
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Users, UserCheck, DollarSign, LogOut, CreditCard, Menu, X } from 'lucide-react';
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

const GymAdminDashboard = ({ gymId, gymName, onLogout }: GymAdminDashboardProps) => {
  const { fetchCurrentGym, clearCurrentGym } = useGymStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gymData, setGymData] = useState<{ gymId: string; gymName: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let resolvedGymId: string | undefined = gymId;
    let resolvedGymName: string | undefined = gymName;

    if (!resolvedGymId || !resolvedGymName) {
      const storedData = localStorage.getItem('gymAdmin');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          resolvedGymId = parsedData.gymId;
          resolvedGymName = parsedData.gymName;
        } catch (error) {
          console.error('Error parsing gym data from localStorage:', error);
          localStorage.removeItem('gymAdmin');
          navigate('/');
          return;
        }
      }
    }

    if (resolvedGymId && resolvedGymName) {
      setGymData({ gymId: resolvedGymId, gymName: resolvedGymName });
      fetchCurrentGym(resolvedGymId);
    } else {
      navigate('/');
    }
  }, [gymId, gymName, navigate, fetchCurrentGym]);

  const handleLogout = () => {
    localStorage.removeItem('gymAdmin');
    clearCurrentGym();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
    { id: 'profile', label: 'Gym Profile', icon: Building2, color: 'from-purple-500 to-purple-600' },
    { id: 'members', label: 'Members', icon: Users, color: 'from-green-500 to-green-600' },
    { id: 'membership-plans', label: 'Membership Plans', icon: CreditCard, color: 'from-orange-500 to-orange-600' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, color: 'from-teal-500 to-teal-600' },
    { id: 'payments', label: 'Payments', icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
  ];

  const renderContent = () => {
    if (!gymData?.gymId) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading gym data...</p>
          </div>
        </div>
      );
    }

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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold truncate">{gymData?.gymName || 'Gym Admin'}</h1>
              <p className="text-blue-100 text-sm">Admin Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white hover:bg-opacity-20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${activeTab === item.id 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-200 group-hover:bg-gray-300'
                }
              `}>
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-sm text-gray-600">
                Manage your gym {activeTab.replace('-', ' ').toLowerCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Card className="h-full shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="h-full p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
