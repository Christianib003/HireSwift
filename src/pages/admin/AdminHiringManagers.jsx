import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import Table from '../../components/common/Table';
import { format } from 'date-fns';

const AdminHiringManagers = () => {
  const [hiringManagers, setHiringManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHiringManagers = async () => {
      try {
        // Get all users first
        const { data: users, error: usersError } = await supabase.auth.listUsers();
        if (usersError) throw usersError;

        // Get hiring managers with their organizations
        const { data: hmData, error: hmError } = await supabase
          .from('hiring_managers')
          .select(`
            *,
            organization:org_id (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (hmError) throw hmError;

        // Create a map of user details
        const userMap = new Map(users.map(user => [user.id, user]));

        // Combine the data
        const managersWithDetails = hmData.map(manager => {
          const user = userMap.get(manager.user_id);
          return {
            ...manager,
            full_name: user?.user_metadata?.full_name || 'N/A',
            email: user?.email || 'N/A'
          };
        });

        setHiringManagers(managersWithDetails);
      } catch (error) {
        console.error('Error fetching hiring managers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHiringManagers();
  }, []);

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'full_name', label: 'Name' },
    { 
      key: 'organization', 
      label: 'Organization',
      render: (row) => row.organization?.name || 'N/A'
    },
    { key: 'title', label: 'Title' },
    { key: 'email', label: 'Email' },
    {
      key: 'created_at',
      label: 'Member Since',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <Table
          columns={columns}
          data={hiringManagers}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminHiringManagers; 