import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import Table from '../../components/common/Table';
import { format } from 'date-fns';

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('name');

        if (error) throw error;
        setOrganizations(data || []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'name', label: 'Organization Name' },
    { key: 'website_url', label: 'Website URL' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'location', label: 'Location' },
    {
      key: 'created_at',
      label: 'Created At',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <Table
          columns={columns}
          data={organizations}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminOrganizations; 