import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';

const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-2 years',
  '2-3 years',
  '3-4 years',
  '4-5 years',
  '5+ years'
];

const StatusSelection = () => {
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    organization: '',
    title: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session); // Debug log
        
        const { data, error } = await supabase
          .from('organizations')
          .select('*');
        
        console.log('Raw response:', { data, error }); // Debug log
        
        if (error) {
          throw error;
        }
        
        if (data) {
          console.log('Organizations fetched:', data);
          setOrganizations(data);
        } else {
          console.log('No organizations found');
          setOrganizations([]);
        }
      } catch (error) {
        console.error('Error details:', error);
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e) => {
    setUserStatus(e.target.value);
    // Reset form data when status changes
    setFormData({
      bio: '',
      experience: '',
      organization: '',
      title: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      if (userStatus === 'talent') {
        const { error: talentError } = await supabase
          .from('talents')
          .insert([
            {
              user_id: user.id,
              bio: formData.bio,
              experience: formData.experience
            }
          ]);

        if (talentError) throw talentError;

      } else if (userStatus === 'hiring_manager') {
        const { error: hmError } = await supabase
          .from('hiring_managers')
          .insert([
            {
              user_id: user.id,
              org_id: formData.organization,
              title: formData.title
            }
          ]);

        if (hmError) throw hmError;
      }

      // Navigate to home with status info
      navigate('/home', { 
        state: { 
          userName: user.user_metadata.full_name,
          userStatus: userStatus 
        }
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-secondary-dark/30 transform -rotate-12" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-secondary-dark/30 transform rotate-12" />
      </div>
      
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl relative z-10 my-8">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Choose Your Role</h1>
            <p className="text-dark/70">Select how you want to use HireSwift</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-dark mb-2 font-medium">
                I want to join as
              </label>
              <select
                name="status"
                value={userStatus}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
                required
              >
                <option value="">Select your role</option>
                <option value="talent">Talent</option>
                <option value="hiring_manager">Hiring Manager</option>
              </select>
            </div>

            {userStatus === 'talent' && (
              <>
                <div className="mb-6">
                  <label className="block text-dark mb-2 font-medium">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
                    rows="4"
                    placeholder="Tell us about yourself"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-dark mb-2 font-medium">
                    Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
                    required
                  >
                    <option value="">Select your experience</option>
                    {EXPERIENCE_OPTIONS.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {userStatus === 'hiring_manager' && (
              <>
                <div className="mb-6">
                  <label className="block text-dark mb-2 font-medium">
                    Organization
                  </label>
                  {isLoadingOrgs ? (
                    <div className="flex items-center justify-center py-2">
                      <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : organizations.length > 0 ? (
                    <select
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
                      required
                    >
                      <option value="">Select your organization</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-red-500 text-sm">
                      No organizations available. Please contact support.
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-dark mb-2 font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
                    placeholder="Your job title"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!userStatus || isLoading}
              className={`w-full py-2 rounded-lg text-white font-medium mt-6 
                ${userStatus && !isLoading
                  ? 'bg-primary hover:opacity-90' 
                  : 'bg-primary/50 cursor-not-allowed'
                } relative`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StatusSelection; 