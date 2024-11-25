import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';

const LOCATION_OPTIONS = ['In-person', 'Hybrid', 'Remote'];
const EMPLOYMENT_TYPES = ['Apprenticeship', 'Internship', 'Part-time', 'Full-time'];
const SALARY_RANGES = ['$100-300', '$300-600', '$600-1000', '$1000-2000', '$2000+'];

const CreateJobForm = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    openPositions: '',
    location: '',
    employmentType: '',
    salaryRange: '',
    skillsRequired: [],
    applicationDeadline: ''
  });
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get minimum date (today) for the deadline
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setError('Failed to load skills');
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      skillsRequired: selectedSkills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('No authenticated user');

      // Get the hiring manager's record
      const { data: hmData, error: hmError } = await supabase
        .from('hiring_managers')
        .select('id, org_id')  // Get both the hiring manager's ID and org_id
        .eq('user_id', session.user.id)
        .single();

      if (hmError) throw hmError;
      if (!hmData) throw new Error('Hiring manager record not found');

      // Create the job with hiring manager's ID
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          description: formData.description,
          open_positions: parseInt(formData.openPositions),
          location: formData.location,
          employment_type: formData.employmentType,
          salary_range: formData.salaryRange,
          skills_required: formData.skillsRequired,
          application_deadline: formData.applicationDeadline,
          org_id: hmData.org_id,
          created_by: hmData.id  // Use the hiring manager's ID instead of auth user ID
        });

      if (jobError) throw jobError;

      // Navigate back to jobs page with state preserved
      navigate('/jobs', { 
        replace: true,
        state: location.state
      });
    } catch (error) {
      console.error('Error creating job:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-dark mb-6">Create New Job</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-dark mb-2 font-medium">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            />
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            />
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Number of Open Positions</label>
            <input
              type="number"
              name="openPositions"
              value={formData.openPositions}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            />
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            >
              <option value="">Select location type</option>
              {LOCATION_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            >
              <option value="">Select employment type</option>
              {EMPLOYMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Salary Range</label>
            <select
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            >
              <option value="">Select salary range</option>
              {SALARY_RANGES.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Required Skills</label>
            <select
              multiple
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleSkillsChange}
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              size="5"
              required
            >
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
            <p className="text-sm text-dark/60 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
          </div>

          <div>
            <label className="block text-dark mb-2 font-medium">Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              min={today}
              className="w-full px-4 py-2 border rounded-lg border-dark/30 focus:outline-none focus:border-dark"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg text-white font-medium
                ${isLoading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:opacity-90'}`}
            >
              {isLoading ? 'Creating...' : 'Create Job'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-dark/30 text-dark hover:bg-dark/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateJobForm; 