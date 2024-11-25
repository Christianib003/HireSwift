import { 
  FaCompass, 
  FaClipboardList, 
  FaCheckCircle, 
  FaFolder, 
  FaHeadset, 
  FaQuestionCircle,
  FaBriefcase,
  FaHistory
} from 'react-icons/fa';

export const TALENT_NAVIGATION = [
  { 
    path: '/explore',
    label: 'Explore',
    icon: FaCompass
  },
  {
    path: '/applications',
    label: 'My Applications',
    icon: FaClipboardList
  },
  {
    path: '/verifications',
    label: 'My Verifications',
    icon: FaCheckCircle
  },
  {
    path: '/documents',
    label: 'My Documents',
    icon: FaFolder
  },
  {
    path: '/support',
    label: 'Support',
    icon: FaHeadset
  },
  {
    path: '/help',
    label: 'Help',
    icon: FaQuestionCircle
  }
];

export const HIRING_MANAGER_NAVIGATION = [
  {
    path: '/jobs',
    label: 'Jobs',
    icon: FaBriefcase
  },
  {
    path: '/hiring-cycles',
    label: 'Hiring Cycles',
    icon: FaHistory
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: FaFolder
  },
  {
    path: '/support',
    label: 'Support',
    icon: FaHeadset
  },
  {
    path: '/help',
    label: 'Help',
    icon: FaQuestionCircle
  }
];

export const PUBLIC_NAVIGATION = [
  {
    path: '/features',
    label: 'Features',
    icon: FaCompass
  },
  {
    path: '/resources',
    label: 'Resources',
    icon: FaFolder
  },
  {
    path: '/about',
    label: 'About',
    icon: FaQuestionCircle
  }
]; 