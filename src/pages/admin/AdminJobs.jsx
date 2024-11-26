import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';
import Table from '../../components/common/Table';
import { format } from 'date-fns';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            organization:org_id (name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'title', label: 'Job Title' },
    { 
      key: 'organization', 
      label: 'Organization',
      render: (row) => row.organization?.name || 'N/A'
    },
    {
      key: 'created_by',
      label: 'Hiring Manager ID',
      render: (row) => row.created_by || 'N/A'
    },
    { key: 'location', label: 'Location' },
    { key: 'employment_type', label: 'Type' },
    {
      key: 'created_at',
      label: 'Created At',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => navigate(`/jobs/${row.id}/details`)}
          className="px-3 py-1 text-sm text-white bg-primary rounded hover:opacity-90"
        >
          Details
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <Table
          columns={columns}
          data={jobs}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminJobs; 