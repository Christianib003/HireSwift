import { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { toast } from 'react-toastify';

const AddStepForm = ({ hiringCycleId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sequence_order: '',
    url: '',
    min_pass_mark: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.sequence_order) {
        toast.error('Please fill in all required fields');
        return;
      }

      const stepData = {
        hiring_cycle_id: hiringCycleId,
        name: formData.name,
        description: formData.description,
        sequence_order: parseInt(formData.sequence_order),
        ...(formData.url && { url: formData.url }),
        ...(formData.min_pass_mark && { min_pass_mark: parseInt(formData.min_pass_mark) }),
        applications: [],
        passed_applications: [],
        failed_applications: []
      };

      const { error } = await supabase
        .from('hiring_cycle_steps')
        .insert([stepData]);

      if (error) throw error;

      toast.success('Step added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Error adding step');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add Hiring Step</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sequence Order *</label>
            <input
              type="number"
              min="1"
              value={formData.sequence_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sequence_order: e.target.value }))}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Resource URL (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Pass Mark % (Optional)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.min_pass_mark}
              onChange={(e) => setFormData(prev => ({ ...prev, min_pass_mark: e.target.value }))}
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

export default AddStepForm; 