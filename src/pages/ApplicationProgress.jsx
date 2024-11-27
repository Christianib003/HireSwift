import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { format } from 'date-fns';
import { FaCircle, FaLongArrowAltDown, FaCheck } from 'react-icons/fa';
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

const TakeHomeProjectForm = ({ step, onSubmit }) => {
  const [marks, setMarks] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(Number(marks));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <a 
          href={step.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline block mb-4"
        >
          Click here to access the Take-home Project
        </a>
        <label className="block text-sm font-medium text-gray-700">Marks Obtained</label>
        <input
          type="number"
          min="0"
          max="100"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          required
          placeholder="Enter marks (0-100)"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
      >
        Submit Marks
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
      // 1. Update application with document URLs
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          resume_url: documents.resume_url,
          cover_letter_url: documents.cover_letter_url
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 2. Find current step and next step
      const currentStep = steps.find(step => step.applications?.includes(id));
      const nextStep = steps.find(step => step.sequence_order === (currentStep.sequence_order + 1));

      // 3. Update current step - remove from applications and add to passed_applications
      const { error: currentStepError } = await supabase
        .from('hiring_cycle_steps')
        .update({
          applications: (currentStep.applications || []).filter(appId => appId !== id),
          passed_applications: [...(currentStep.passed_applications || []), id]
        })
        .eq('id', currentStep.id);

      if (currentStepError) throw currentStepError;

      // 4. Update next step - add to applications
      if (nextStep) {
        const { error: nextStepError } = await supabase
          .from('hiring_cycle_steps')
          .update({
            applications: [...(nextStep.applications || []), id]
          })
          .eq('id', nextStep.id);

        if (nextStepError) throw nextStepError;
      }

      toast.success('Documents submitted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast.error('Error submitting documents');
    }
  };

  const handleMarksSubmission = async (marks) => {
    try {
      // Find current step and next step
      const currentStep = steps.find(step => step.applications?.includes(id));
      const nextStep = steps.find(step => step.sequence_order === (currentStep.sequence_order + 1));

      // Get current application to access existing cumulative_marks
      const { data: currentApp, error: appError } = await supabase
        .from('applications')
        .select('cumulative_marks')
        .eq('id', id)
        .single();

      if (appError) throw appError;

      // Prepare new cumulative marks array
      const newCumulativeMarks = [
        ...(currentApp.cumulative_marks || []),
        marks
      ];

      if (marks < currentStep.min_pass_mark) {
        // Failed scenario
        const { error: failedStepError } = await supabase
          .from('hiring_cycle_steps')
          .update({
            applications: (currentStep.applications || []).filter(appId => appId !== id),
            failed_applications: [...(currentStep.failed_applications || []), id]
          })
          .eq('id', currentStep.id);

        if (failedStepError) throw failedStepError;

        // Update application status to failed and add marks
        const { error: failedAppError } = await supabase
          .from('applications')
          .update({
            status: 'failed',
            cumulative_marks: newCumulativeMarks
          })
          .eq('id', id);

        if (failedAppError) throw failedAppError;

        toast.error(`Failed to meet minimum pass mark of ${currentStep.min_pass_mark}%`);
      } else {
        // Passed scenario
        // Update current step
        const { error: currentStepError } = await supabase
          .from('hiring_cycle_steps')
          .update({
            applications: (currentStep.applications || []).filter(appId => appId !== id),
            passed_applications: [...(currentStep.passed_applications || []), id]
          })
          .eq('id', currentStep.id);

        if (currentStepError) throw currentStepError;

        // If there's a next step, add application to it
        if (nextStep) {
          const { error: nextStepError } = await supabase
            .from('hiring_cycle_steps')
            .update({
              applications: [...(nextStep.applications || []), id]
            })
            .eq('id', nextStep.id);

          if (nextStepError) throw nextStepError;
        }

        // Update application with new marks
        const { error: updateAppError } = await supabase
          .from('applications')
          .update({
            cumulative_marks: newCumulativeMarks
          })
          .eq('id', id);

        if (updateAppError) throw updateAppError;

        toast.success('Marks submitted successfully!');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error submitting marks:', error);
      toast.error('Error submitting marks');
    }
  };

  const isStepActive = (step) => {
    return step.applications && step.applications.includes(id);
  };

  const isStepPassed = (step) => {
    return step.passed_applications && step.passed_applications.includes(id);
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
                    relative flex flex-col items-center p-4 rounded-lg border-2
                    ${isStepPassed(step) 
                      ? 'border-[#59c9a5] bg-[#59c9a5]/5'
                      : isStepActive(step)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 bg-gray-50'
                    }
                  `}>
                    {isStepPassed(step) && (
                      <div className="absolute top-2 right-2">
                        <FaCheck className="w-5 h-5 text-[#59c9a5]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <FaCircle className={`w-3 h-3 
                        ${isStepPassed(step)
                          ? 'text-[#59c9a5]'
                          : isStepActive(step)
                            ? 'text-primary'
                            : 'text-gray-400'
                        }`}
                      />
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
                    {isStepActive(step) && step.name === "Take-home Project" && (
                      <TakeHomeProjectForm 
                        step={step}
                        onSubmit={handleMarksSubmission}
                      />
                    )}
                    {isStepActive(step) && step.name === "Final Interview" && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        {application.interview_time ? (
                          <div className="space-y-2">
                            <p className="font-medium">Interview Scheduled</p>
                            <p>Time: {format(new Date(application.interview_time), 'MMMM d, yyyy HH:mm')}</p>
                            <a 
                              href={step.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 mt-2"
                            >
                              Join Interview
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-600">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Please wait while the Interview is being scheduled...
                          </div>
                        )}
                      </div>
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