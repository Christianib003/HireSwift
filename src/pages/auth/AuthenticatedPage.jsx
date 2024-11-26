import React from 'react';
import { useLocation } from 'react-router-dom';
import SideNav from '../../components/layout/SideNav';
import TopBar from '../../components/layout/TopBar';

const AuthenticatedPage = ({ children }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Get the base route (e.g., 'hiring-cycles', 'jobs', etc.)
  const baseRoute = pathSegments[0];
  
  // Convert route to title (e.g., 'hiring-cycles' -> 'Hiring Cycles')
  const getTitle = (route) => {
    return route
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Build breadcrumb title
  const getBreadcrumbTitle = () => {
    const baseTitle = getTitle(baseRoute);
    if (pathSegments.length > 2 && pathSegments[2] === 'details') {
      return `${baseTitle} > ${pathSegments[1]}`;
    }
    return baseTitle;
  };

  return (
    <div className="flex h-screen bg-background">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <TopBar title={getBreadcrumbTitle()} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedPage; 