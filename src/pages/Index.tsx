
import { useState } from 'react';
import LoginTypeSelector from '@/components/LoginTypeSelector';
import AuthComponent from '@/components/AuthComponent';
import GymAdminAuth from '@/components/GymAdminAuth';
import EnhancedMemberAuth from '@/components/EnhancedMemberAuth';
import GymAdminDashboard from '@/components/GymAdminDashboard';
import MemberDashboard from '@/components/MemberDashboard';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedType, setSelectedType] = useState<'admin' | 'member' | 'super_admin' | null>(null);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    userType: string;
    userId?: string;
    userName?: string;
    gymId?: string;
    gymName?: string;
  }>({
    isAuthenticated: false,
    userType: ''
  });
  const navigate = useNavigate();

  const handleSelectType = (type: 'admin' | 'member' | 'super_admin') => {
    if (type === 'super_admin') {
      navigate('/super-admin');
    } else {
      setSelectedType(type);
    }
  };

  const handleSuperAdminAuthSuccess = () => {
    console.log('Super admin authenticated successfully');
  };

  const handleGymAdminAuthSuccess = (gymId: string, gymName: string) => {
    setAuthState({
      isAuthenticated: true,
      userType: 'gym_admin',
      gymId,
      gymName
    });
  };

  const handleMemberAuthSuccess = (memberId: string, memberName: string, gymId: string) => {
    setAuthState({
      isAuthenticated: true,
      userType: 'member',
      userId: memberId,
      userName: memberName,
      gymId
    });
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      userType: ''
    });
    setSelectedType(null);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  // Show appropriate dashboard based on auth state
  if (authState.isAuthenticated) {
    if (authState.userType === 'gym_admin') {
      return (
        <GymAdminDashboard
          onLogout={handleLogout}
        />
      );
    }
    
    if (authState.userType === 'member' && authState.userId && authState.userName && authState.gymId) {
      return (
        <MemberDashboard
          memberId={authState.userId}
          memberName={authState.userName}
          gymId={authState.gymId}
          onLogout={handleLogout}
        />
      );
    }
  }

  // Show login type selector if no type is selected
  if (!selectedType) {
    return <LoginTypeSelector onSelectType={handleSelectType} />;
  }

  // Show appropriate auth component based on selected type
  if (selectedType === 'admin') {
    return (
      <GymAdminAuth
        onAuthSuccess={handleGymAdminAuthSuccess}
        onBack={handleBack}
      />
    );
  }

  if (selectedType === 'member') {
    return (
      <EnhancedMemberAuth
        onAuthSuccess={handleMemberAuthSuccess}
        onBack={handleBack}
      />
    );
  }

  // Fallback for super admin (shouldn't reach here normally)
  return <AuthComponent onAuthSuccess={handleSuperAdminAuthSuccess} />;
};

export default Index;
