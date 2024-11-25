import Welcome from '../pages/Welcome';
import TempPage from '../pages/TempPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import StatusSelection from '../pages/auth/StatusSelection';
import Home from '../pages/Home';

export const routes = [
  {
    path: '/',
    element: Welcome,
  },
  {
    path: '/features',
    element: TempPage,
    props: { title: 'Features' },
  },
  {
    path: '/resources',
    element: TempPage,
    props: { title: 'Resources' },
  },
  {
    path: '/about',
    element: TempPage,
    props: { title: 'About' },
  },
  {
    path: '/login',
    element: Login,
  },
  {
    path: '/register',
    element: Register,
  },
  {
    path: '/get-started',
    element: TempPage,
    props: { title: 'Get Started' },
  },
  {
    path: '/admin',
    element: TempPage,
    props: { title: 'Admin Portal' },
  },
  {
    path: '/select-status',
    element: StatusSelection,
  },
  {
    path: '/home',
    element: Home,
  },
]; 