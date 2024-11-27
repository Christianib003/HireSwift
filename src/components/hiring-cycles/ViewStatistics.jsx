import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Table from '../common/Table';
import { supabase } from '../../supabase/supabaseClient';

ChartJS.register(ArcElement, Tooltip, Legend);

const StepStatistics = ({ step, totalApplications }) => {
  const passedCount = (step.passed_applications || []).length;
  const failedCount = (step.failed_applications || []).length;
  const totalCount = passedCount + failedCount;
  const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  const data = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [passedCount, failedCount],
        backgroundColor: ['#59c9a5', '#ff8a7a'],
        borderColor: ['#59c9a5', '#ff8a7a'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h4 className="font-medium mb-2">{step.name}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Applications: {totalCount}</p>
          <p className="text-sm text-gray-600">Pass Rate: {passRate.toFixed(1)}%</p>
        </div>
        <div className="w-32 h-32 mx-auto">
          {totalCount > 0 && <Pie data={data} />}
        </div>
      </div>
    </div>
  );
};

const ViewStatistics = ({ hiringCycle, onClose }) => {
  const [steps, setSteps] = useState([]);
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch steps
        const { data: stepsData } = await supabase
          .from('hiring_cycle_steps')
          .select('*')
          .eq('hiring_cycle_id', hiringCycle.id)
          .order('sequence_order');

        // Fetch job details
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', hiringCycle.job_id)
          .single();

        // Get the final step (last step in sequence)
        const finalStep = stepsData[stepsData.length - 1];
        
        // Get only passed applications from the final step
        const passedApplications = finalStep.passed_applications || [];

        if (passedApplications.length > 0) {
          // Fetch details for passed applications
          const { data: applicationsData, error: appError } = await supabase
            .from('applications')
            .select('*')
            .in('id', passedApplications);

          if (appError) throw appError;

          if (applicationsData) {
            // Calculate average marks and sort
            const applicationsWithAvg = applicationsData
              .map(app => ({
                ...app,
                average_marks: app.cumulative_marks?.length > 0
                  ? app.cumulative_marks.reduce((a, b) => a + b, 0) / app.cumulative_marks.length
                  : 0
              }))
              .sort((a, b) => b.average_marks - a.average_marks);

            console.log('Processed applications:', applicationsWithAvg); // Debug log
            setApplications(applicationsWithAvg);
          }
        }

        setSteps(stepsData);
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hiringCycle]);

  const handleHire = async (applicationId) => {
    // Hire logic will go here
    console.log('Hiring application:', applicationId);
  };

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'id', label: 'Application ID' },
    {
      key: 'average_marks',
      label: 'Average Marks',
      render: (row) => row.average_marks?.toFixed(2) || 'N/A'
    },
    {
      key: 'cumulative_marks',
      label: 'All Marks',
      render: (row) => row.cumulative_marks?.join(', ') || 'N/A'
    },
    {
      key: 'created_at',
      label: 'Applied At',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row, rowIndex) => {
        const openPositions = job?.open_positions || 0;
        const totalApplications = applications.length;
        const canHire = rowIndex < Math.min(openPositions, totalApplications);

        return canHire ? (
          <button
            onClick={() => handleHire(row.id)}
            className="px-3 py-1 text-sm text-white bg-[#59c9a5] rounded hover:opacity-90"
          >
            Hire
          </button>
        ) : null;
      }
    }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[calc(100%-16rem)] ml-64 mr-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{hiringCycle.name}</h2>
            <p className="text-gray-600">
              Created on {format(new Date(hiringCycle.created_at), 'MMMM d, yyyy')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Steps Statistics</h3>
            <div className="space-y-4">
              {steps.map(step => (
                <StepStatistics 
                  key={step.id} 
                  step={step}
                  totalApplications={applications.length}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Final Rankings</h3>
            <p className="text-gray-600 mb-4">
              Open Positions: {job?.open_positions || 0}
            </p>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={applications}
                rowClassName={(row, index) => {
                  const openPositions = job?.open_positions || 0;
                  const totalApplications = applications.length;
                  return index < Math.min(openPositions, totalApplications) 
                    ? 'bg-[#59c9a5]/10' 
                    : '';
                }}
              />
            </div>
          </div>

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

export default ViewStatistics; 