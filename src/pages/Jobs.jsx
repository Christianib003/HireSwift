import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSadTear, FaPlus } from 'react-icons/fa';
import { supabase } from '../supabase/supabaseClient';
import CreateJobForm from '../components/jobs/CreateJobForm';
import { toast } from 'react-toastify';

const Jobs = ({ userStatus: defaultUserStatus }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userStatus = defaultUserStatus } = location.state || {};
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [hiringManagerId, setHiringManagerId] = useState(null);

  useEffect(() => {
    // Fetch the user's org_id and hiring manager id when component mounts
    const fetchUserDetails = async () => {
      try {
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        // Get the hiring manager's details from hiring_managers table
        const { data: hiringManager, error: hiringManagerError } = await supabase
          .from('hiring_managers')
          .select('id, org_id')
          .eq('user_id', user.id)
          .single();

        if (hiringManagerError) throw hiringManagerError;
        
        if (!hiringManager?.org_id) {
          throw new Error('No organization found for this hiring manager');
        }

        setOrgId(hiringManager.org_id);
        setHiringManagerId(hiringManager.id);
      } catch (err) {
        console.error('Error fetching hiring manager details:', err);
        toast.error('Error fetching organization details: ' + err.message);
      }
    };

    if (userStatus === 'hiring_manager') {
      fetchUserDetails();
    }
  }, [userStatus]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let query = supabase.from('jobs').select('*');
        
        if (userStatus === 'hiring_manager' && orgId) {
          query = query.eq('org_id', orgId);
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
  }, [userStatus, orgId]);

  const handleJobCreation = async (jobData) => {
    try {
      if (!orgId || !hiringManagerId) {
        throw new Error('Organization ID or Hiring Manager ID not found');
      }

      // Create the job with org_id, created_by, and skills_required
      const { data: newJob, error: jobError } = await supabase
        .from('jobs')
        .insert([{ 
          ...jobData, 
          org_id: orgId,
          created_by: hiringManagerId,
          skills_required: jobData.skills_required
        }])
        .select()
        .single();

      if (jobError) throw jobError;

      // Create the hiring cycle with updated structure
      const hiringCycleData = {
        name: newJob.title,
        description: `${newJob.title} - Application Deadline: ${jobData.application_deadline}`,
        is_active: true,
        job_id: newJob.id,
        created_by: hiringManagerId
      };
      
      const { data: hiringCycle, error: hiringCycleError } = await supabase
        .from('hiring_cycles')
        .insert([hiringCycleData])
        .select()
        .single();

      if (hiringCycleError) throw hiringCycleError;
      
      // Show success notification
      toast.success('Job created successfully!', {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#59c9a5',
          color: 'white'
        }
      });

      // Close the form and update the jobs list
      setShowCreateForm(false);
      setJobs(prevJobs => [...prevJobs, newJob]);

      // Redirect to the hiring cycle page
      navigate(`/hiring-cycles/${hiringCycle.id}`);
    } catch (error) {
      toast.error('Error creating job: ' + error.message);
      console.error('Error:', error);
    }
  };

  const content = () => {
    if (showCreateForm) {
      return (
        <div className="min-h-screen bg-[#fff3f2] py-8">
          <CreateJobForm 
            onClose={() => setShowCreateForm(false)} 
            onSubmit={handleJobCreation}
          />
        </div>
      );
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

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      {content()}
    </div>
  );
};

export default Jobs; 