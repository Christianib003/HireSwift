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
import AdminJobs from '../pages/admin/AdminJobs';
import AdminSkills from '../pages/admin/AdminSkills';
import AdminOrganizations from '../pages/admin/AdminOrganizations';
import AdminVerifications from '../pages/admin/AdminVerifications';
import AdminVerificationDetails from '../pages/admin/AdminVerificationDetails';

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

// Wrapper components for authenticated admin routes
const AuthenticatedAdminJobs = () => (
  <AuthenticatedPage>
    <AdminJobs />
  </AuthenticatedPage>
);

const AuthenticatedAdminSkills = () => (
  <AuthenticatedPage>
    <AdminSkills />
  </AuthenticatedPage>
);

const AuthenticatedAdminOrganizations = () => (
  <AuthenticatedPage>
    <AdminOrganizations />
  </AuthenticatedPage>
);

const AuthenticatedAdminPlaceholder = ({ title }) => (
  <AuthenticatedPage>
    <PlaceholderPage title={title} />
  </AuthenticatedPage>
);

const AuthenticatedAdminVerifications = () => (
  <AuthenticatedPage>
    <AdminVerifications />
  </AuthenticatedPage>
);

const AuthenticatedAdminVerificationDetails = () => (
  <AuthenticatedPage>
    <AdminVerificationDetails />
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
  },
  // Admin routes
  {
    path: '/admin/jobs',
    element: AuthenticatedAdminJobs
  },
  {
    path: '/admin/skills',
    element: AuthenticatedAdminSkills
  },
  {
    path: '/admin/organizations',
    element: AuthenticatedAdminOrganizations
  },
  {
    path: '/admin/support',
    element: () => <AuthenticatedAdminPlaceholder title="Support" />
  },
  {
    path: '/admin/help',
    element: () => <AuthenticatedAdminPlaceholder title="Help" />
  },
  {
    path: '/admin/verifications',
    element: AuthenticatedAdminVerifications
  },
  {
    path: '/admin/verifications/:id',
    element: AuthenticatedAdminVerificationDetails
  }
];

export default routes; 