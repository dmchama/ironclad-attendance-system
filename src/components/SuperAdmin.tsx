
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SuperAdminAuth from './SuperAdminAuth';
import SuperAdminDashboard from './SuperAdminDashboard';

const SuperAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user is super admin
        const { data: adminData } = await supabase
          .from('super_admin_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        setIsAuthenticated(!!adminData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SuperAdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return <SuperAdminDashboard onLogout={handleLogout} />;
};

export default SuperAdmin;
