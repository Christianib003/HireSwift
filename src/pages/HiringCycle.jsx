import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { toast } from 'react-toastify';

const STEP_TYPES = [
  'Document Submission',
  'Take-home Project',
  'Technical Interview',
  'Final Interview'
];

const StepModal = ({ isOpen, onClose, onAdd, currentStepsCount, stepType }) => {
  const [stepData, setStepData] = useState({
    name: '',
    description: '',
    sequence_order: 0,
    url: '',
    min_pass_mark: ''
  });

  useEffect(() => {
    if (isOpen && stepType) {
      setStepData({
        name: stepType,
        description: '',
        sequence_order: currentStepsCount + 1,
        url: '',
        min_pass_mark: ''
      });
    }
  }, [isOpen, stepType, currentStepsCount]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(stepData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add Hiring Step</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={stepData.name}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={stepData.description}
              onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL (Optional)</label>
            <input
              type="url"
              value={stepData.url}
              onChange={(e) => setStepData(prev => ({ ...prev, url: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Pass Mark (Optional)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={stepData.min_pass_mark}
              onChange={(e) => setStepData(prev => ({ ...prev, min_pass_mark: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
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
              Add Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HiringCycle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiringCycle, setHiringCycle] = useState(null);
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStepType, setSelectedStepType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHiringCycle = async () => {
      try {
        const { data, error } = await supabase
          .from('hiring_cycles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setHiringCycle(data);
        setDescription(data.description);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Error fetching hiring cycle details');
      }
    };

    fetchHiringCycle();
  }, [id]);

  const handleStepTypeChange = (e) => {
    setSelectedStepType(e.target.value);
    if (e.target.value) {
      setShowModal(true);
    }
  };

  const handleAddStep = (stepData) => {
    const { type, ...stepWithoutType } = stepData;
    setSteps(prev => [...prev, stepWithoutType]);
    setSelectedStepType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update hiring cycle description
      const { error: cycleError } = await supabase
        .from('hiring_cycles')
        .update({ description })
        .eq('id', id);

      if (cycleError) throw cycleError;

      // Create all steps without the type field
      const stepsToCreate = steps.map(step => ({
        name: step.name,
        description: step.description,
        sequence_order: step.sequence_order,
        url: step.url || null,  // Make sure optional fields are null if empty
        min_pass_mark: step.min_pass_mark || null,
        hiring_cycle_id: id
      }));

      const { error: stepsError } = await supabase
        .from('hiring_cycle_steps')
        .insert(stepsToCreate);

      if (stepsError) throw stepsError;

      toast.success('Hiring cycle updated successfully!', {
        position: "bottom-left",
        autoClose: 3000,
        style: {
          backgroundColor: '#59c9a5',
          color: 'white'
        }
      });

      navigate('/jobs');
    } catch (error) {
      toast.error('Error updating hiring cycle: ' + error.message);
      console.error('Error:', error);
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
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Hiring Cycle Setup</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={hiringCycle?.name || ''}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Add Hiring Step</label>
            <select
              value={selectedStepType}
              onChange={handleStepTypeChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            >
              <option value="">Select step type</option>
              {STEP_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {steps.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Added Steps:</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="p-3 border rounded-md bg-gray-50">
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.url && (
                      <p className="text-sm text-gray-600">URL: {step.url}</p>
                    )}
                    {step.min_pass_mark && (
                      <p className="text-sm text-gray-600">Minimum Pass Mark: {step.min_pass_mark}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Update Hiring Cycle
            </button>
          </div>
        </form>

        <StepModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAddStep}
          currentStepsCount={steps.length}
          stepType={selectedStepType}
        />
      </div>
    </div>
  );
};

export default HiringCycle; 