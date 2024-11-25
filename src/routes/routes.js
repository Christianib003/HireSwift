import Welcome from '../pages/Welcome';
import TempPage from '../pages/TempPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import StatusSelection from '../pages/auth/StatusSelection';
import Home from '../pages/Home';
import Jobs from '../pages/Jobs';
import PlaceholderPage from '../pages/PlaceholderPage';

// Create route component functions
const createTempPageComponent = (title) => {
  return function TempPageComponent() {
    return <TempPage title={title} />;
  };
};

const createPlaceholderComponent = (title) => {
  return function PlaceholderComponent() {
    return <PlaceholderPage title={title} />;
  };
};

const TalentJobsComponent = () => {
  return <Jobs userStatus="talent" />;
};

const HiringManagerJobsComponent = () => {
  return <Jobs userStatus="hiring_manager" />;
};

export const routes = [
  {
    path: '/',
    element: Welcome
  },
  {
    path: '/features',
    element: createTempPageComponent('Features')
  },
  {
    path: '/resources',
    element: createTempPageComponent('Resources')
  },
  {
    path: '/about',
    element: createTempPageComponent('About')
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
    element: TalentJobsComponent
  },
  {
    path: '/jobs',
    element: HiringManagerJobsComponent
  },
  {
    path: '/applications',
    element: createPlaceholderComponent('My Applications')
  },
  {
    path: '/verifications',
    element: createPlaceholderComponent('My Verifications')
  },
  {
    path: '/documents',
    element: createPlaceholderComponent('Documents')
  },
  {
    path: '/hiring-cycles',
    element: createPlaceholderComponent('Hiring Cycles')
  },
  {
    path: '/support',
    element: createPlaceholderComponent('Support')
  },
  {
    path: '/help',
    element: createPlaceholderComponent('Help')
  }
]; 