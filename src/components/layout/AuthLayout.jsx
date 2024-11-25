import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { supabase } from '../../supabase/supabaseClient';
import { TALENT_NAVIGATION, HIRING_MANAGER_NAVIGATION } from '../../constants/navigation';

const AuthLayout = ({ children, userName, userStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigation = userStatus === 'talent' 
    ? TALENT_NAVIGATION 
    : HIRING_MANAGER_NAVIGATION;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Vertical Navbar */}
      <nav className="w-1/8 min-w-[200px] bg-background flex flex-col h-screen fixed">
        <div className="p-4 border-b border-text/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-text w-8 h-8" />
              <span className="text-text font-medium truncate">
                {userName}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-text hover:opacity-80 p-1"
              >
                <FaChevronDown />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-dark hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 py-4">
          {navigation.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link flex items-center gap-3 px-4 py-2 mb-1 transition-colors
                ${location.pathname === path 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-primary/10'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="ml-[200px] flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-end px-6 relative z-10">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary">
            <FaBell className="text-[#fad6c6]" />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 bg-[#fff3f2] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout; 