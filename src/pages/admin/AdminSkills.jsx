import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import Table from '../../components/common/Table';
import { format } from 'date-fns';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');

        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'name', label: 'Skill Name' },
    { key: 'category', label: 'Category' },
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
          data={skills}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminSkills; 