import { useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, userStatus } = location.state || {};

  useEffect(() => {
    if (userName && userStatus) {
      if (userStatus === 'talent') {
        navigate('/explore', { state: { userName, userStatus } });
      } else if (userStatus === 'hiring_manager') {
        navigate('/jobs', { state: { userName, userStatus } });
      }
    }
  }, [userStatus, userName, navigate]);

  if (!userName || !userStatus) {
    return <Navigate to="/login" />;
  }

  return (
    <AuthLayout userName={userName} userStatus={userStatus}>
      <div className="text-dark">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {userName}!
        </h1>
        <p className="text-xl">
          You are logged in as a {userStatus.replace('_', ' ')}.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Home; 