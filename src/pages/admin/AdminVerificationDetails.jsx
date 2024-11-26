import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';
import { toast } from 'react-toastify';

const AdminVerificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verification, setVerification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('verifications')
          .select(`
            *,
            talent:talent_id (
              full_name
            ),
            skill:skill_id (
              name,
              description
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setVerification(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error fetching verification details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('verifications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Verification ${newStatus} successfully!`, {
        position: "bottom-left",
        autoClose: 3000,
        style: {
          backgroundColor: '#59c9a5',
          color: 'white'
        }
      });

      navigate('/admin/verifications');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating verification status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!verification) return null;

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">Verification Request Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Talent</h3>
                <p className="text-gray-700">{verification.talent?.full_name}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Skill</h3>
                <p className="text-gray-700 font-medium">{verification.skill?.name}</p>
                <p className="text-gray-600 mt-2">{verification.skill?.description}</p>
              </div>

              {verification.doc_url && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Supporting Document</h3>
                  <a 
                    href={verification.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {verification.status === 'pending' && (
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="px-4 py-2 text-sm font-medium text-white bg-[#ff8a7a] rounded-md hover:opacity-90"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate('approved')}
                className="px-4 py-2 text-sm font-medium text-white bg-[#59c9a5] rounded-md hover:opacity-90"
              >
                Approve
              </button>
            </div>
          )}

          <div className="border-t pt-6">
            <button
              onClick={() => navigate('/admin/verifications')}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Back to Verifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationDetails; 