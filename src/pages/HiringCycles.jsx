import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { FaSadTear } from 'react-icons/fa';
import { format } from 'date-fns';

const HiringCycles = () => {
  const navigate = useNavigate();
  const [hiringCycles, setHiringCycles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHiringCycles = async () => {
      try {
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        // Get the hiring manager's ID
        const { data: hiringManager, error: hiringManagerError } = await supabase
          .from('hiring_managers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (hiringManagerError) throw hiringManagerError;

        // Get all hiring cycles created by this hiring manager
        const { data, error } = await supabase
          .from('hiring_cycles')
          .select('*')
          .eq('created_by', hiringManager.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHiringCycles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHiringCycles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading hiring cycles: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Hiring Cycles</h2>
        
        {hiringCycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-dark/70">
            <FaSadTear className="w-16 h-16 mb-4" />
            <p className="text-xl">No hiring cycles found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hiringCycles.map(cycle => (
              <div key={cycle.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-dark">{cycle.name}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(cycle.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-dark/70 mb-4">{cycle.description}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/hiring-cycles/${cycle.id}/details`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
                  >
                    Details
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

export default HiringCycles; 