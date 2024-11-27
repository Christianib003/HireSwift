import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { FaSadTear, FaArrowRight } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get talent ID
        const { data: talent } = await supabase
          .from('talents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!talent) return;

        // Get applications with job details
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:job_id (
              title,
              description,
              organization:org_id (name)
            )
          `)
          .eq('talent_id', talent.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <span className="text-gray-600 font-medium">Not Started</span>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="max-w-6xl mx-auto">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-dark/70">
            <FaSadTear className="w-16 h-16 mb-4" />
            <p className="text-xl">You haven't applied to any jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(application => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-dark">{application.job.title}</h3>
                    <p className="text-gray-600">{application.job.organization.name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">
                      {format(new Date(application.created_at), 'MMM d, yyyy')}
                    </span>
                    {getStatusBadge(application.status)}
                  </div>
                </div>
                <p className="text-dark/70 mb-4">{application.job.description}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/applications/${application.id}/progress`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
                  >
                    Open
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications; 