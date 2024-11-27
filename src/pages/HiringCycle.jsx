import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import StepDetails from '../components/hiring-cycles/StepDetails';
import ViewStatistics from '../components/hiring-cycles/ViewStatistics';

const HiringCycle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiringCycle, setHiringCycle] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [hasApplications, setHasApplications] = useState(false);

  useEffect(() => {
    const fetchHiringCycleDetails = async () => {
      try {
        // Fetch hiring cycle details
        const { data: cycleData, error: cycleError } = await supabase
          .from('hiring_cycles')
          .select(`
            *,
            job:job_id (
              title,
              description,
              application_deadline
            )
          `)
          .eq('id', id)
          .single();

        if (cycleError) throw cycleError;

        // Fetch steps for this hiring cycle
        const { data: stepsData, error: stepsError } = await supabase
          .from('hiring_cycle_steps')
          .select('*')
          .eq('hiring_cycle_id', id)
          .order('sequence_order');

        if (stepsError) throw stepsError;

        setHiringCycle(cycleData);
        setSteps(stepsData);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Error fetching hiring cycle details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHiringCycleDetails();
  }, [id]);

  useEffect(() => {
    const checkApplications = async () => {
      try {
        // Get the final step
        const { data: steps } = await supabase
          .from('hiring_cycle_steps')
          .select('applications, passed_applications, failed_applications')
          .eq('hiring_cycle_id', id)
          .order('sequence_order', { ascending: false })
          .limit(1);

        const finalStep = steps?.[0];
        const hasApps = finalStep && (
          (finalStep.applications?.length > 0 || 
           finalStep.passed_applications?.length > 0 || 
           finalStep.failed_applications?.length > 0)
        );

        setHasApplications(hasApps);
      } catch (error) {
        console.error('Error checking applications:', error);
      }
    };

    checkApplications();
  }, [id]);

  const handleStepClick = async (step) => {
    try {
      // Fetch applications for this step
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .in('id', [
          ...(step.applications || []),
          ...(step.passed_applications || []),
          ...(step.failed_applications || [])
        ]);

      if (error) throw error;

      setSelectedStep({
        ...step,
        applications: applications
      });
    } catch (error) {
      console.error('Error fetching step applications:', error);
      toast.error('Error fetching applications');
    }
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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Job Details</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium">{hiringCycle.job.title}</p>
              <p className="text-gray-600 mt-2">{hiringCycle.job.description}</p>
              <p className="text-gray-600 mt-2">
                Application Deadline: {format(new Date(hiringCycle.job.application_deadline), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Hiring Cycle Description</h3>
            <p className="text-gray-600">{hiringCycle.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Hiring Steps</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleStepClick(step)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {index + 1}. {step.name}
                      </h4>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                      {step.url && (
                        <a 
                          href={step.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline mt-1 block"
                        >
                          Resource Link
                        </a>
                      )}
                      {step.min_pass_mark && (
                        <p className="text-gray-600 mt-1">
                          Minimum Pass Mark: {step.min_pass_mark}%
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {step.applications ? step.applications.length : 0} Applicants
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/hiring-cycles')}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
          >
            Back to Hiring Cycles
          </button>

          {hasApplications && (
            <button
              onClick={() => setShowStatistics(true)}
              className="px-6 py-2 text-sm font-medium text-white bg-[#59c9a5] rounded-md hover:opacity-90"
            >
              View Statistics
            </button>
          )}
        </div>
      </div>

      {selectedStep && (
        <StepDetails
          step={selectedStep}
          onClose={() => setSelectedStep(null)}
        />
      )}

      {showStatistics && (
        <ViewStatistics
          hiringCycle={hiringCycle}
          onClose={() => setShowStatistics(false)}
        />
      )}
    </div>
  );
};

export default HiringCycle; 