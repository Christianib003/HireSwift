import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import routes from './routes/routes.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/supabaseClient';

// Create a wrapper component to handle the navbar visibility
const AppContent = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Public routes where navbar should be shown
  const publicRoutes = ['/', '/features', '/resources', '/about', '/register', '/login'];
  const shouldShowNavbar = publicRoutes.includes(location.pathname) || !isLoggedIn;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {shouldShowNavbar && <Navbar isLoggedIn={isLoggedIn} />}
      <Routes>
        {routes.map((route) => {
          const RouteElement = route.element;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                typeof RouteElement === 'function' 
                  ? <RouteElement {...route.props} />
                  : <RouteElement />
              }
            />
          );
        })}
      </Routes>
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
