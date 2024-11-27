import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import Table from '../common/Table';
import { supabase } from '../../supabase/supabaseClient';
import { toast } from 'react-toastify';

const InterviewScheduleForm = ({ applicationId, onClose, onSubmit }) => {
  const [interviewTime, setInterviewTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(applicationId, interviewTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Schedule Interview</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Interview Date & Time</label>
            <input
              type="datetime-local"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InterviewGradingForm = ({ applicationId, minPassMark, onClose, onSubmit }) => {
  const [marks, setMarks] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(applicationId, Number(marks));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Grade Interview</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Interview Marks</label>
            <input
              type="number"
              min="0"
              max="100"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
              placeholder={`Minimum pass mark: ${minPassMark}%`}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Submit Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StepDetails = ({ step, onClose }) => {
  const [filter, setFilter] = useState('all');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const getFilteredApplications = () => {
    const applications = step.applications || [];
    
    const passedIds = (step.passed_applications || []).map(id => 
      typeof id === 'string' ? id : id.toString()
    );
    const failedIds = (step.failed_applications || []).map(id => 
      typeof id === 'string' ? id : id.toString()
    );
    const ongoingIds = (step.applications || []).map(id => 
      typeof id === 'string' ? id : id.toString()
    );

    switch (filter) {
      case 'ongoing':
        return applications.filter(app => ongoingIds.includes(app.id.toString()));
      case 'passed':
        return applications.filter(app => passedIds.includes(app.id.toString()));
      case 'failed':
        return applications.filter(app => failedIds.includes(app.id.toString()));
      case 'unknown':
        return applications.filter(app => 
          !passedIds.includes(app.id.toString()) && 
          !failedIds.includes(app.id.toString()) && 
          !ongoingIds.includes(app.id.toString())
        );
      default:
        return applications;
    }
  };

  const getApplicationStatus = (appId) => {
    const id = appId.toString();
    if ((step.passed_applications || []).map(i => i.toString()).includes(id)) return 'Passed';
    if ((step.failed_applications || []).map(i => i.toString()).includes(id)) return 'Failed';
    if ((step.applications || []).map(i => i.toString()).includes(id)) return 'Ongoing';
    return 'Unknown';
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-white text-sm";
    switch (status) {
      case 'Passed':
        return <span className={`${baseClasses} bg-[#59c9a5]`}>Passed</span>;
      case 'Failed':
        return <span className={`${baseClasses} bg-[#ff8a7a]`}>Failed</span>;
      case 'Ongoing':
        return <span className={`${baseClasses} bg-primary`}>Ongoing</span>;
      default:
        return <span className={`${baseClasses} bg-gray-400`}>Unknown</span>;
    }
  };

  const handleScheduleInterview = async (applicationId, interviewTime) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ interview_time: interviewTime })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Interview scheduled successfully!');
      setScheduleModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Error scheduling interview');
    }
  };

  const handleGradeSubmission = async (applicationId, marks) => {
    try {
      // Get current application to access existing cumulative_marks
      const { data: currentApp, error: appError } = await supabase
        .from('applications')
        .select('cumulative_marks')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      // Prepare new cumulative marks array
      const newCumulativeMarks = [
        ...(currentApp.cumulative_marks || []),
        marks
      ];

      // Determine if passed or failed
      const passed = marks >= step.min_pass_mark;

      // Get the current step data to access the arrays
      const { data: currentStep, error: stepFetchError } = await supabase
        .from('hiring_cycle_steps')
        .select('applications, passed_applications, failed_applications')
        .eq('id', step.id)
        .single();

      if (stepFetchError) throw stepFetchError;

      // Update step arrays
      const { error: stepError } = await supabase
        .from('hiring_cycle_steps')
        .update({
          // Remove the application ID from applications array
          applications: (currentStep.applications || [])
            .filter(id => id !== applicationId),
          // Add to appropriate array based on pass/fail
          passed_applications: passed 
            ? [...(currentStep.passed_applications || []), applicationId]
            : (currentStep.passed_applications || []),
          failed_applications: !passed 
            ? [...(currentStep.failed_applications || []), applicationId]
            : (currentStep.failed_applications || [])
        })
        .eq('id', step.id);

      if (stepError) throw stepError;

      // Update application marks
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          cumulative_marks: newCumulativeMarks
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      toast.success('Marks submitted successfully!');
      setGradingModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting marks:', error);
      toast.error('Error submitting marks');
    }
  };

  const getColumns = () => {
    const baseColumns = [
      { key: 'no', label: 'No' },
      { key: 'id', label: 'Application ID' },
      {
        key: 'created_at',
        label: 'Created At',
        render: (row) => row.created_at ? format(new Date(row.created_at), 'MMM d, yyyy') : 'N/A'
      },
      {
        key: 'resume_url',
        label: 'Resume',
        render: (row) => row.resume_url ? (
          <a
            href={row.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Resume
          </a>
        ) : 'N/A'
      },
      {
        key: 'cover_letter_url',
        label: 'Cover Letter',
        render: (row) => row.cover_letter_url ? (
          <a
            href={row.cover_letter_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Cover Letter
          </a>
        ) : 'N/A'
      },
      {
        key: 'cumulative_marks',
        label: 'Cumulative Marks',
        render: (row) => row.cumulative_marks?.length > 0 
          ? row.cumulative_marks.join(', ')
          : 'N/A'
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => getStatusBadge(getApplicationStatus(row.id))
      }
    ];

    if (step.name === "Final Interview") {
      baseColumns.push(
        {
          key: 'interview',
          label: 'Interview',
          render: (row) => {
            if (row.interview_time) {
              return (
                <button
                  onClick={() => window.open(step.url, '_blank')}
                  className="px-3 py-1 text-sm text-white bg-[#59c9a5] rounded hover:opacity-90"
                >
                  Join
                </button>
              );
            }
            const status = getApplicationStatus(row.id);
            if (status === 'Unknown' || status === 'Ongoing') {
              return (
                <button
                  onClick={() => {
                    setSelectedApplicationId(row.id);
                    setScheduleModalOpen(true);
                  }}
                  className="px-3 py-1 text-sm text-white bg-primary rounded hover:opacity-90"
                >
                  Schedule
                </button>
              );
            }
            return 'N/A';
          }
        },
        {
          key: 'interview_time',
          label: 'Interview Time',
          render: (row) => row.interview_time ? 
            format(new Date(row.interview_time), 'MMM d, yyyy HH:mm') : 
            'Not scheduled'
        },
        {
          key: 'grading',
          label: 'Grading',
          render: (row) => {
            const status = getApplicationStatus(row.id);
            if (status === 'Unknown' || status === 'Ongoing') {
              return (
                <button
                  onClick={() => {
                    setSelectedApplicationId(row.id);
                    setGradingModalOpen(true);
                  }}
                  className="px-3 py-1 text-sm text-white bg-primary rounded hover:opacity-90"
                >
                  Add Marks
                </button>
              );
            }
            return 'N/A';
          }
        }
      );
    }

    return baseColumns;
  };

  const filteredApplications = getFilteredApplications();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[calc(100%-16rem)] ml-64 mr-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Step Details */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{step.name}</h2>
            <p className="text-gray-600 mb-4">{step.description}</p>
            {step.url && (
              <a 
                href={step.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block mb-4"
              >
                Resource Link
              </a>
            )}
            {step.min_pass_mark && (
              <p className="text-gray-600">
                Minimum Pass Mark: {step.min_pass_mark}%
              </p>
            )}
          </div>

          {/* Applications Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Applications</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Applications</option>
                <option value="ongoing">Ongoing</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="unknown">Not Started</option>
              </select>
            </div>

            {filteredApplications.length > 0 ? (
              <Table
                columns={getColumns()}
                data={filteredApplications}
                isLoading={false}
              />
            ) : (
              <p className="text-center text-gray-500 py-4">
                No {filter === 'all' ? '' : filter} applications found
              </p>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {scheduleModalOpen && (
        <InterviewScheduleForm
          applicationId={selectedApplicationId}
          onClose={() => setScheduleModalOpen(false)}
          onSubmit={handleScheduleInterview}
        />
      )}

      {gradingModalOpen && (
        <InterviewGradingForm
          applicationId={selectedApplicationId}
          minPassMark={step.min_pass_mark}
          onClose={() => setGradingModalOpen(false)}
          onSubmit={handleGradeSubmission}
        />
      )}
    </div>
  );
};

export default StepDetails; 