import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import routes from './routes/routes.jsx'

// Create a wrapper component to handle the navbar visibility
const AppContent = () => {
  const location = useLocation();
  const authPaths = [
    '/explore',
    '/jobs',
    '/applications',
    '/verifications',
    '/documents',
    '/hiring-cycles',
    '/support',
    '/help',
    '/home'
  ];
  
  const hideNavbarPaths = ['/register', '/login', '/select-status', ...authPaths];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {shouldShowNavbar && <Navbar />}
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
