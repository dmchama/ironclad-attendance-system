
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, UserCheck, LogOut, Building2 } from "lucide-react";
import UserManagement from "@/components/UserManagement";
import AttendanceManagement from "@/components/AttendanceManagement";
import PaymentManagement from "@/components/PaymentManagement";
import Dashboard from "@/components/Dashboard";
import GymProfile from "@/components/GymProfile";
import GymSetup from "@/components/GymSetup";
import AuthComponent from "@/components/AuthComponent";
import { supabase } from "@/integrations/supabase/client";
import { useGymStore } from "@/store/gymStore";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsGymSetup, setNeedsGymSetup] = useState(false);
  const { fetchUsers, fetchAttendance, fetchPayments, fetchCurrentGym, currentGym } = useGymStore();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkGymSetup();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentGym) {
      loadData();
    }
  }, [isAuthenticated, currentGym]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGymSetup = async () => {
    try {
      await fetchCurrentGym();
      const { currentGym: gym } = useGymStore.getState();
      
      if (!gym) {
        setNeedsGymSetup(true);
      } else {
        setNeedsGymSetup(false);
      }
    } catch (error) {
      console.error('Error checking gym setup:', error);
      setNeedsGymSetup(true);
    }
  };

  const loadData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchAttendance(),
        fetchPayments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setActiveTab("dashboard");
      setNeedsGymSetup(false);
      
      toast({
        title: "Success",
        description: "Signed out successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGymCreated = () => {
    setNeedsGymSetup(false);
    checkGymSetup();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthComponent onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (needsGymSetup) {
    return <GymSetup onGymCreated={handleGymCreated} />;
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: UserCheck },
    { id: "profile", label: "Gym Profile", icon: Building2 },
    { id: "users", label: "Members", icon: Users },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "payments", label: "Payments", icon: DollarSign },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <GymProfile />;
      case "users":
        return <UserManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "payments":
        return <PaymentManagement />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              FitTrack Pro
            </h1>
            <p className="text-gray-600">
              {currentGym ? `Managing ${currentGym.name}` : 'Complete gym management solution'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "outline"}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300 ease-in-out">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
