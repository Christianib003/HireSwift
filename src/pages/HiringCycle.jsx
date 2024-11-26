import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const HiringCycle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiringCycle, setHiringCycle] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
                <div key={step.id} className="border rounded-md p-4">
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

        <div className="mt-8">
          <button
            onClick={() => navigate('/hiring-cycles')}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
          >
            Back to Hiring Cycles
          </button>
        </div>
      </div>
    </div>
  );
};

export default HiringCycle; 