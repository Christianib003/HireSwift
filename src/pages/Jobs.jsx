import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSadTear, FaPlus } from 'react-icons/fa';
import { supabase } from '../supabase/supabaseClient';
import CreateJobForm from '../components/jobs/CreateJobForm';

const Jobs = ({ userStatus: defaultUserStatus }) => {
  const location = useLocation();
  const { userStatus = defaultUserStatus } = location.state || {};
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let query = supabase.from('jobs').select('*');
        
        if (userStatus === 'hiring_manager') {
          // Add org_id filter when available
          // query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        setJobs(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [userStatus]);

  const content = () => {
    if (showCreateForm) {
      return <CreateJobForm onClose={() => setShowCreateForm(false)} />;
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-center p-4">
          Error loading jobs: {error}
        </div>
      );
    }

    return (
      <>
        {userStatus === 'hiring_manager' && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <FaPlus />
              Create Job
            </button>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark/70">
            <FaSadTear className="w-16 h-16 mb-4" />
            <p className="text-xl">There seems to be no jobs to see at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div 
                key={job.id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-dark mb-2">{job.title}</h3>
                <p className="text-dark/70 mb-4">{job.description}</p>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return content();
};

export default Jobs; 