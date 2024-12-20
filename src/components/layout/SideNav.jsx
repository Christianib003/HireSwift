import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaBriefcase, 
  FaClipboardList, 
  FaFileAlt, 
  FaCheckCircle, 
  FaQuestionCircle, 
  FaHeadset, 
  FaSearch,
  FaCogs,
  FaBuilding,
  FaUserCheck
} from 'react-icons/fa';
import { supabase } from '../../supabase/supabaseClient';
import UserDropdown from './UserDropdown';

const SideNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user is an admin
        const { data: admin } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Check if user is a hiring manager
        const { data: hiringManager } = await supabase
          .from('hiring_managers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Check if user is a talent
        const { data: talent } = await supabase
          .from('talents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (admin) {
          setUserRole('admin');
        } else if (hiringManager) {
          setUserRole('hiring_manager');
        } else if (talent) {
          setUserRole('talent');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  const getNavItems = () => {
    if (userRole === 'admin') {
      return [
        { path: '/admin/jobs', icon: FaBriefcase, label: 'Jobs' },
        { path: '/admin/skills', icon: FaCogs, label: 'Skills' },
        { path: '/admin/verifications', icon: FaUserCheck, label: 'Verification Requests' },
        { path: '/admin/organizations', icon: FaBuilding, label: 'Organizations' },
        { path: '/admin/support', icon: FaHeadset, label: 'Support' },
        { path: '/admin/help', icon: FaQuestionCircle, label: 'Help' }
      ];
    } else if (userRole === 'hiring_manager') {
      return [
        { path: '/jobs', icon: FaBriefcase, label: 'My Jobs' },
        { path: '/hiring-cycles', icon: FaClipboardList, label: 'Hiring Cycles' },
        { path: '/documents', icon: FaFileAlt, label: 'Documents' },
        { path: '/support', icon: FaHeadset, label: 'Support' },
        { path: '/help', icon: FaQuestionCircle, label: 'Help' }
      ];
    } else if (userRole === 'talent') {
      return [
        { path: '/explore', icon: FaSearch, label: 'Explore' },
        { path: '/applications', icon: FaClipboardList, label: 'My Applications' },
        { path: '/verifications', icon: FaCheckCircle, label: 'My Verifications' },
        { path: '/documents', icon: FaFileAlt, label: 'Documents' },
        { path: '/support', icon: FaHeadset, label: 'Support' },
        { path: '/help', icon: FaQuestionCircle, label: 'Help' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  if (!userRole) {
    return null;
  }

  return (
    <nav className="w-64 bg-[#2c1338] h-screen flex flex-col">
      <div className="p-4 border-b border-white/10">
        <UserDropdown />
      </div>
      <div className="flex-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-3 px-4 py-2 transition-colors ${
              currentPath === path
                ? 'bg-[#e57cd8] text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SideNav; 