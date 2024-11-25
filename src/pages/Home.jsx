import { useLocation, Navigate } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const { userName, userStatus } = location.state || {};

  if (!userName || !userStatus) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center text-text">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {userName}!
        </h1>
        <p className="text-xl">
          You are logged in as a {userStatus.replace('_', ' ')}.
        </p>
      </div>
    </div>
  );
};

export default Home; 