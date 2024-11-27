import { useState } from 'react';
import { format } from 'date-fns';
import Table from '../common/Table';

const StepDetails = ({ step, onClose }) => {
  const [filter, setFilter] = useState('all');

  const getFilteredApplications = () => {
    const applications = step.applications || [];
    const applicationIds = applications.map(app => app.id);
    const passedIds = step.passed_applications || [];
    const failedIds = step.failed_applications || [];
    const ongoingIds = step.applications || [];

    switch (filter) {
      case 'ongoing':
        return applications.filter(app => ongoingIds.includes(app.id));
      case 'passed':
        return applications.filter(app => passedIds.includes(app.id));
      case 'failed':
        return applications.filter(app => failedIds.includes(app.id));
      default:
        return applications;
    }
  };

  const getApplicationStatus = (appId) => {
    if (step.passed_applications?.includes(appId)) return 'Passed';
    if (step.failed_applications?.includes(appId)) return 'Failed';
    if (step.applications?.includes(appId)) return 'Ongoing';
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

  const columns = [
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
              </select>
            </div>

            {filteredApplications.length > 0 ? (
              <Table
                columns={columns}
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
    </div>
  );
};

export default StepDetails; 