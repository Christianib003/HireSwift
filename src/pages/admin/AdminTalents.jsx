import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import Table from '../../components/common/Table';
import { format } from 'date-fns';

const AdminTalents = () => {
  const [talents, setTalents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        // Get all users first
        const { data: users, error: usersError } = await supabase.auth.listUsers();
        if (usersError) throw usersError;

        // Get talents data
        const { data: talentData, error: talentError } = await supabase
          .from('talents')
          .select('*')
          .order('created_at', { ascending: false });

        if (talentError) throw talentError;

        // Create a map of user details
        const userMap = new Map(users.map(user => [user.id, user]));

        // Combine the data
        const talentsWithDetails = talentData.map(talent => {
          const user = userMap.get(talent.user_id);
          return {
            ...talent,
            full_name: user?.user_metadata?.full_name || 'N/A',
            email: user?.email || 'N/A'
          };
        });

        setTalents(talentsWithDetails);
      } catch (error) {
        console.error('Error fetching talents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalents();
  }, []);

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'experience', label: 'Experience' },
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
          data={talents}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminTalents; 