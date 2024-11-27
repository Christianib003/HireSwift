import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';
import Table from '../../components/common/Table';
import { FaSadTear } from 'react-icons/fa';
import { format } from 'date-fns';

const AdminVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        let query = supabase
          .from('verifications')
          .select(`
            *,
            skill:skill_id (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setVerifications(data || []);
      } catch (error) {
        console.error('Error fetching verifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifications();
  }, [filter]);

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-white text-sm";
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-[#59c9a5]`}>Approved</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-[#ff8a7a]`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-[#d5d0d7]`}>Pending</span>;
    }
  };

  const columns = [
    { key: 'no', label: 'No' },
    { 
      key: 'talent_id', 
      label: 'Talent ID'
    },
    {
      key: 'skill',
      label: 'Skill',
      render: (row) => row.skill?.name || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'doc_url',
      label: 'Document',
      render: (row) => (
        <a
          href={row.doc_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          View Document
        </a>
      )
    },
    {
      key: 'created_at',
      label: 'Submitted At',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => row.status === 'pending' && (
        <button
          onClick={() => navigate(`/admin/verifications/${row.id}`)}
          className="px-3 py-1 text-sm text-white bg-primary rounded hover:opacity-90"
        >
          Review
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        {!isLoading && verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSadTear className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">
              No {filter === 'all' ? '' : filter} verification requests found
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={verifications}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminVerifications; 