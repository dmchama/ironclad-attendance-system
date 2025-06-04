
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, Plus, UserCheck } from "lucide-react";
import UserManagement from "@/components/UserManagement";
import AttendanceManagement from "@/components/AttendanceManagement";
import PaymentManagement from "@/components/PaymentManagement";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: UserCheck },
    { id: "users", label: "Members", icon: Users },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "payments", label: "Payments", icon: DollarSign },
  ];

  const renderContent = () => {
    switch (activeTab) {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FitTrack Pro
          </h1>
          <p className="text-gray-600">Complete gym management solution</p>
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
