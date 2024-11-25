import Welcome from '../pages/Welcome';
import TempPage from '../pages/TempPage';

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
    element: TempPage,
    props: { title: 'Login' },
  },
  {
    path: '/register',
    element: TempPage,
    props: { title: 'Register' },
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
]; 