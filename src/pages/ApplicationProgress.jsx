import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { format } from 'date-fns';
import { FaCircle, FaLongArrowAltDown } from 'react-icons/fa';

const ApplicationProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [hiringCycle, setHiringCycle] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Get application details with job info
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            job:job_id (
              title,
              description,
              application_deadline,
              organization:org_id (name)
            )
          `)
          .eq('id', id)
          .single();

        if (appError) throw appError;

        // Get hiring cycle for this job
        const { data: cycleData, error: cycleError } = await supabase
          .from('hiring_cycles')
          .select('*')
          .eq('job_id', appData.job_id)
          .single();

        if (cycleError) throw cycleError;

        // Get steps for this hiring cycle
        const { data: stepsData, error: stepsError } = await supabase
          .from('hiring_cycle_steps')
          .select('*')
          .eq('hiring_cycle_id', cycleData.id)
          .order('sequence_order');

        if (stepsError) throw stepsError;

        setApplication(appData);
        setHiringCycle(cycleData);
        setSteps(stepsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application || !hiringCycle || !steps.length) return null;

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-8">
          {/* Job Details Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{application.job.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Organization</p>
                <p className="font-medium">{application.job.organization.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Date</p>
                <p className="font-medium">
                  {format(new Date(application.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Status</p>
                <p className="font-medium capitalize">{application.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="font-medium">
                  {format(new Date(application.job.application_deadline), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Steps Flow Chart */}
          <div>
            <h3 className="text-lg font-medium mb-6">Hiring Process Steps</h3>
            <div className="flex flex-col items-center space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="w-full">
                  <div className={`
                    flex flex-col items-center p-4 rounded-lg border-2
                    ${application.status === 'pending' ? 'border-gray-300 bg-gray-50' : 'border-primary bg-primary/5'}
                  `}>
                    <div className="flex items-center gap-3">
                      <FaCircle className={`w-3 h-3 ${application.status === 'pending' ? 'text-gray-400' : 'text-primary'}`} />
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                    {step.min_pass_mark && (
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum Pass Mark: {step.min_pass_mark}%
                      </p>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <FaLongArrowAltDown className="text-gray-400 w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="border-t pt-6">
            <button
              onClick={() => navigate('/applications')}
              className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationProgress; 