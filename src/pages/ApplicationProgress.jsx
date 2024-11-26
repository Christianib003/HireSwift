import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { format } from 'date-fns';
import { FaCircle, FaLongArrowAltDown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DocumentSubmissionForm = ({ step, onSubmit }) => {
  const [formData, setFormData] = useState({
    resume_url: '',
    cover_letter_url: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Resume (CV) URL</label>
        <input
          type="url"
          value={formData.resume_url}
          onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
          required
          placeholder="https://example.com/resume.pdf"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Letter URL</label>
        <input
          type="url"
          value={formData.cover_letter_url}
          onChange={(e) => setFormData(prev => ({ ...prev, cover_letter_url: e.target.value }))}
          required
          placeholder="https://example.com/cover-letter.pdf"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
      >
        Submit Documents
      </button>
    </form>
  );
};

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
        console.log("Fetching application details for ID:", id);
        // Get application details with job info
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            job:job_id (
              id,
              title,
              description,
              application_deadline,
              organization:org_id (name)
            )
          `)
          .eq('id', id)
          .single();

        if (appError) {
          console.error("Application fetch error:", appError);
          throw appError;
        }

        console.log("Application data:", appData);

        // Get hiring cycle for this job
        const { data: cycleData, error: cycleError } = await supabase
          .from('hiring_cycles')
          .select('*')
          .eq('job_id', appData.job.id)
          .single();

        if (cycleError) {
          console.error("Hiring cycle fetch error:", cycleError);
          throw cycleError;
        }

        console.log("Hiring cycle data:", cycleData);

        // Get steps for this hiring cycle
        const { data: stepsData, error: stepsError } = await supabase
          .from('hiring_cycle_steps')
          .select('*')
          .eq('hiring_cycle_id', cycleData.id)
          .order('sequence_order');

        if (stepsError) {
          console.error("Steps fetch error:", stepsError);
          throw stepsError;
        }

        console.log("Steps data:", stepsData);

        setApplication(appData);
        setHiringCycle(cycleData);
        setSteps(stepsData || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error fetching application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleStartApplication = async () => {
    try {
      // Update application status to active
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'active' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Get the first step
      const firstStep = steps.find(step => step.sequence_order === 1);
      if (!firstStep) throw new Error('No first step found');

      // Add application ID to the first step's applications array
      const { error: stepError } = await supabase
        .from('hiring_cycle_steps')
        .update({
          applications: [...(firstStep.applications || []), id]
        })
        .eq('id', firstStep.id);

      if (stepError) throw stepError;

      // Refresh the page to show updated state
      window.location.reload();
    } catch (error) {
      console.error('Error starting application:', error);
      toast.error('Error starting application');
    }
  };

  const handleDocumentSubmission = async (documents) => {
    try {
      // Update application with document URLs
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          resume_url: documents.resume_url,
          cover_letter_url: documents.cover_letter_url
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Documents submitted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast.error('Error submitting documents');
    }
  };

  const isStepActive = (step) => {
    return step.applications && step.applications.includes(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application || !hiringCycle || !steps.length) {
    console.log("Missing data:", { application, hiringCycle, steps });
    return (
      <div className="min-h-screen bg-[#fff3f2] p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-center text-gray-600">No data available</p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/applications')}
              className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                    ${isStepActive(step) ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'}
                  `}>
                    <div className="flex items-center gap-3">
                      <FaCircle className={`w-3 h-3 ${isStepActive(step) ? 'text-primary' : 'text-gray-400'}`} />
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                    {step.min_pass_mark && (
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum Pass Mark: {step.min_pass_mark}%
                      </p>
                    )}
                    {isStepActive(step) && step.name === "Document Submission" && (
                      <DocumentSubmissionForm 
                        step={step}
                        onSubmit={handleDocumentSubmission}
                      />
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

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => navigate('/applications')}
              className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Back to Applications
            </button>
            
            {application.status === 'pending' && (
              <button
                onClick={handleStartApplication}
                className="px-6 py-2 text-sm font-medium text-white bg-[#59c9a5] rounded-md hover:opacity-90"
              >
                Start Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationProgress; 