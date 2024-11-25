import { useEffect, useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { supabase } from '../../supabase/supabaseClient';

const AuthenticatedPage = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        // Try to get data from location state first
        if (location.state?.userName && location.state?.userStatus) {
          setUserData({
            userName: location.state.userName,
            userStatus: location.state.userStatus
          });
          return;
        }

        // If no state, fetch from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }

        const [
          { data: talentData },
          { data: hmData }
        ] = await Promise.all([
          supabase.from('talents').select('id').eq('user_id', user.id),
          supabase.from('hiring_managers').select('id').eq('user_id', user.id)
        ]);

        const userStatus = talentData?.length > 0 ? 'talent' : 
                         hmData?.length > 0 ? 'hiring_manager' : null;

        if (userStatus) {
          const userData = {
            userName: user.user_metadata.full_name,
            userStatus
          };
          setUserData(userData);
          
          // Update location state
          navigate(location.pathname, {
            replace: true,
            state: userData
          });
        } else {
          navigate('/select-status', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData?.userName || !userData?.userStatus) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthLayout userName={userData.userName} userStatus={userData.userStatus}>
      {children}
    </AuthLayout>
  );
};

export default AuthenticatedPage; 