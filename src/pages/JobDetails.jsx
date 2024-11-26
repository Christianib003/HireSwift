import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { format } from 'date-fns';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // First fetch the job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;

        // Then fetch the skills based on the skills_required array
        if (jobData.skills_required && jobData.skills_required.length > 0) {
          const { data: skillsData, error: skillsError } = await supabase
            .from('skills')
            .select('id, name')
            .in('id', jobData.skills_required);

          if (skillsError) throw skillsError;
          setSkills(skillsData || []);
        }

        setJob(jobData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#fff3f2] p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Type</p>
                <p className="font-medium">{job.employment_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p className="font-medium">{job.salary_range}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Open Positions</p>
                <p className="font-medium">{job.open_positions}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Application Deadline</h3>
            <p className="text-gray-600">
              {format(new Date(job.application_deadline), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 