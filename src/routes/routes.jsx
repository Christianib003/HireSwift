import { lazy } from 'react';
import Welcome from '../pages/Welcome';
import TempPage from '../pages/TempPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import StatusSelection from '../pages/auth/StatusSelection';
import Home from '../pages/Home';
import Jobs from '../pages/Jobs';
import PlaceholderPage from '../pages/PlaceholderPage';
import AuthenticatedPage from '../pages/auth/AuthenticatedPage';
import HiringCycles from '../pages/HiringCycles';
import HiringCycle from '../pages/HiringCycle';
import JobDetails from '../pages/JobDetails';

// Wrapper components for authenticated routes
const AuthenticatedJobs = ({ userStatus }) => (
  <AuthenticatedPage>
    <Jobs userStatus={userStatus} />
  </AuthenticatedPage>
);

const AuthenticatedPlaceholder = ({ title }) => (
  <AuthenticatedPage>
    <PlaceholderPage title={title} />
  </AuthenticatedPage>
);

const AuthenticatedHiringCycles = () => (
  <AuthenticatedPage>
    <HiringCycles />
  </AuthenticatedPage>
);

const AuthenticatedHiringCycle = () => (
  <AuthenticatedPage>
    <HiringCycle />
  </AuthenticatedPage>
);

const AuthenticatedJobDetails = () => (
  <AuthenticatedPage>
    <JobDetails />
  </AuthenticatedPage>
);

const routes = [
  {
    path: '/',
    element: Welcome
  },
  {
    path: '/features',
    element: () => <TempPage title="Features" />
  },
  {
    path: '/resources',
    element: () => <TempPage title="Resources" />
  },
  {
    path: '/about',
    element: () => <TempPage title="About" />
  },
  {
    path: '/login',
    element: Login
  },
  {
    path: '/register',
    element: Register
  },
  {
    path: '/select-status',
    element: StatusSelection
  },
  {
    path: '/home',
    element: Home
  },
  {
    path: '/explore',
    element: () => <AuthenticatedJobs userStatus="talent" />
  },
  {
    path: '/jobs',
    element: () => <AuthenticatedJobs userStatus="hiring_manager" />
  },
  {
    path: '/applications',
    element: () => <AuthenticatedPlaceholder title="My Applications" />
  },
  {
    path: '/verifications',
    element: () => <AuthenticatedPlaceholder title="My Verifications" />
  },
  {
    path: '/documents',
    element: () => <AuthenticatedPlaceholder title="Documents" />
  },
  {
    path: '/hiring-cycles',
    element: AuthenticatedHiringCycles
  },
  {
    path: '/hiring-cycles/:id/details',
    element: AuthenticatedHiringCycle
  },
  {
    path: '/support',
    element: () => <AuthenticatedPlaceholder title="Support" />
  },
  {
    path: '/help',
    element: () => <AuthenticatedPlaceholder title="Help" />
  },
  {
    path: '/jobs/:id/details',
    element: AuthenticatedJobDetails
  }
];

export default routes; 