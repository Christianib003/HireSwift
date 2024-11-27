import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import Table from '../components/common/Table';
import { FaSadTear, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const VerificationForm = ({ onClose, onSubmit }) => {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    skill_id: '',
    doc_url: ''
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setSkills(data || []);
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    fetchSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skill_id || !formData.doc_url) {
      toast.error('Please fill in all fields');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Apply for Skill Verification</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Skill</label>
            <select
              value={formData.skill_id}
              onChange={(e) => setFormData(prev => ({ ...prev, skill_id: e.target.value }))}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supporting Document URL</label>
            <input
              type="url"
              value={formData.doc_url}
              onChange={(e) => setFormData(prev => ({ ...prev, doc_url: e.target.value }))}
              required
              placeholder="https://example.com/document"
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
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Verifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [talentId, setTalentId] = useState(null);

  useEffect(() => {
    const fetchTalentId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: talent, error } = await supabase
          .from('talents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTalentId(talent.id);
      } catch (error) {
        console.error('Error fetching talent ID:', error);
      }
    };

    fetchTalentId();
  }, []);

  useEffect(() => {
    const fetchVerifications = async () => {
      if (!talentId) return;

      try {
        let query = supabase
          .from('verifications')
          .select(`
            *,
            skill:skill_id (
              name
            )
          `)
          .eq('talent_id', talentId)
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setVerifications(data || []);
      } catch (error) {
        console.error('Error fetching verifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifications();
  }, [talentId, filter]);

  const handleVerificationSubmit = async (formData) => {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the talent's ID
      const { data: talent, error: talentError } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (talentError) throw talentError;
      if (!talent) throw new Error('Talent not found');

      // Create the verification with the talent's ID
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert([{
          talent_id: talent.id,
          skill_id: formData.skill_id,
          doc_url: formData.doc_url,
          status: 'pending'
        }]);

      if (verificationError) throw verificationError;

      toast.success('Verification request submitted successfully!');
      setShowForm(false);

      // Refresh verifications list
      const { data: updatedVerifications, error: fetchError } = await supabase
        .from('verifications')
        .select('*, skill:skill_id (name)')
        .eq('talent_id', talent.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setVerifications(updatedVerifications || []);
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Error submitting verification request: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-white text-sm";
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-[#59c9a5]`}>Approved</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-[#ff8a7a]`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-[#d5d0d7]`}>Pending</span>;
    }
  };

  const columns = [
    { key: 'no', label: 'No' },
    {
      key: 'skill',
      label: 'Skill',
      render: (row) => row.skill?.name || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'doc_url',
      label: 'Document',
      render: (row) => (
        <a
          href={row.doc_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          View Document
        </a>
      )
    },
    {
      key: 'created_at',
      label: 'Submitted At',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
          >
            <FaPlus />
            Apply for Verification
          </button>
        </div>

        {!isLoading && verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSadTear className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">
              No {filter === 'all' ? '' : filter} verifications found
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={verifications}
            isLoading={isLoading}
          />
        )}
      </div>

      {showForm && (
        <VerificationForm
          onClose={() => setShowForm(false)}
          onSubmit={handleVerificationSubmit}
        />
      )}
    </div>
  );
};

export default Verifications; 