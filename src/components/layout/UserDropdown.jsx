import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { supabase } from '../../supabase/supabaseClient';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Loading...');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Get the user's full name from auth metadata
        const fullName = user.user_metadata?.full_name;
        
        if (!fullName) {
          throw new Error('Name not found');
        }

        setUserName(fullName);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setUserName('Error loading name');
        if (err.message?.includes('auth')) {
          navigate('/login');
        }
      }
    };

    fetchUserName();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-white hover:opacity-80 transition-opacity w-full"
      >
        <FaUserCircle className="w-8 h-8" />
        <span className="font-medium text-left flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {userName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown; 