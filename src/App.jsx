import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import routes from './routes/routes.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  
  // Show navbar for non-authenticated routes
  const isAuthPath = authPaths.includes(location.pathname) || 
    location.pathname.includes('/hiring-cycles/');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAuthPath && <Navbar />}
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
