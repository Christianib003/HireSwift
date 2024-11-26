import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';

const CreateJobForm = ({ onClose, onSubmit }) => {
  const [skills, setSkills] = useState([]); // All available skills
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    open_positions: '',
    location: '',
    employment_type: '',
    salary_range: '',
    application_deadline: '',
    skills_required: [] // Array to store selected skill IDs
  });

  // Fetch skills when component mounts
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle skill selection/deselection
  const handleSkillChange = (skillId) => {
    setFormData(prev => {
      const updatedSkills = prev.skills_required.includes(skillId)
        ? prev.skills_required.filter(id => id !== skillId)
        : [...prev.skills_required, skillId];

      return {
        ...prev,
        skills_required: updatedSkills
      };
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one skill is selected
    if (formData.skills_required.length === 0) {
      return; // Don't submit if no skills are selected
    }
    
    await onSubmit(formData);
  };

  const locationOptions = ['In-person', 'Hybrid', 'Remote'];
  const employmentTypes = ['Apprenticeship', 'Internship', 'Part-time', 'Full-time'];
  const salaryRanges = [
    '$100 - $300',
    '$300 - $600',
    '$600 - $1000',
    '$1000 - $2000',
    '$2000+'
  ];

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create New Job
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="open_positions" className="block text-sm font-medium text-gray-700">
                Number of Open Positions
              </label>
              <input
                type="number"
                id="open_positions"
                name="open_positions"
                value={formData.open_positions}
                onChange={handleChange}
                required
                min="1"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              >
                <option value="">Select location type</option>
                {locationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700">
                Employment Type
              </label>
              <select
                id="employment_type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              >
                <option value="">Select employment type</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                Salary Range
              </label>
              <select
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              >
                <option value="">Select salary range</option>
                {salaryRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700">
                Application Deadline
              </label>
              <input
                type="date"
                id="application_deadline"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleChange}
                required
                min={getCurrentDate()}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-gray-300 rounded-md p-3">
                {skills.map(skill => (
                  <div key={skill.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`skill-${skill.id}`}
                      checked={formData.skills_required.includes(skill.id)}
                      onChange={() => handleSkillChange(skill.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`skill-${skill.id}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {skill.name}
                    </label>
                  </div>
                ))}
              </div>
              {formData.skills_required.length === 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Please select at least one required skill
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="group relative w-1/4 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group relative w-1/4 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobForm; 