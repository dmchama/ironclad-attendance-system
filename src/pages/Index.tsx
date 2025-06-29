
import { useState, useEffect } from 'react';
import UnifiedAuth from '@/components/UnifiedAuth';
import GymAdminDashboard from '@/components/GymAdminDashboard';
import MemberDashboard from '@/components/MemberDashboard';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    userType: string | null;
    userId?: string;
    userName?: string;
    gymId?: string;
    gymName?: string;
  }>({
    isAuthenticated: false,
    userType: null
  });

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: adminData } = await supabase
          .from('super_admin_roles')
          .select('user_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminData) {
          setAuthState({ isAuthenticated: true, userType: 'super_admin' });
        }
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        // If user signs out, newSession is null
        if (!newSession) {
            setAuthState({ isAuthenticated: false, userType: null });
        }
        setSession(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleSessionChange = async () => {
      if (session?.user) {
        setLoading(true);
        const { data: adminData } = await supabase
          .from('super_admin_roles')
          .select('user_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminData) {
          setAuthState({ isAuthenticated: true, userType: 'super_admin' });
        } else {
          // Not a super admin, but has a session. This shouldn't happen in our flow
          // unless they were signed in from a previous state. Sign them out.
          await supabase.auth.signOut();
          setAuthState({ isAuthenticated: false, userType: null });
        }
        setLoading(false);
      }
    };
    handleSessionChange();
  }, [session]);

  const handleAuthSuccess = (authData: {
    userType: string;
    userId?: string;
    userName?: string;
    gymId?: string;
    gymName?: string;
  }) => {
    console.log('=== AUTH SUCCESS: Received auth data:', authData);
    
    if (authData.userType === 'gym_admin' && authData.gymId && authData.gymName) {
      // Store the actual gym ID returned from authentication
      const gymAdminData = {
        gymId: authData.gymId,  // This should be the actual gym ID
        gymName: authData.gymName,
        userId: authData.userId
      };
      
      console.log('=== AUTH SUCCESS: Storing gym admin data:', gymAdminData);
      localStorage.setItem('gymAdmin', JSON.stringify(gymAdminData));
    }
    
    setAuthState({
      isAuthenticated: true,
      ...authData,
    });
  };

  const handleLogout = async () => {
    console.log('=== LOGOUT: Clearing auth state and localStorage');
    
    if (authState.userType === 'super_admin') {
      await supabase.auth.signOut();
    }
    
    // Clear all stored data
    localStorage.removeItem('gymAdmin');
    
    setAuthState({
      isAuthenticated: false,
      userType: null
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Show appropriate dashboard based on auth state
  if (authState.isAuthenticated) {
    if (authState.userType === 'super_admin') {
      return <SuperAdminDashboard onLogout={handleLogout} />;
    }
    if (authState.userType === 'gym_admin') {
      return <GymAdminDashboard gymId={authState.gymId} gymName={authState.gymName} onLogout={handleLogout} />;
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

  // If not authenticated, show the unified login form
  return <UnifiedAuth onAuthSuccess={handleAuthSuccess} />;
};

export default Index;
