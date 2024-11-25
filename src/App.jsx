import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import { routes } from './routes/routes'

// Create a wrapper component to handle the navbar visibility
const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/register', '/login'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.element {...route.props} />}
          />
        ))}
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
