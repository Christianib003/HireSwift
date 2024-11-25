import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import { supabase } from '../../supabase/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Sign in user
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        if (authData?.user) {
          console.log('Auth successful:', authData);
          
          // Get user's role
          const [
            { data: talentData },
            { data: hmData }
          ] = await Promise.all([
            supabase.from('talents').select('*').eq('user_id', authData.user.id),
            supabase.from('hiring_managers').select('*').eq('user_id', authData.user.id)
          ]);

          console.log('Role check:', { talentData, hmData });

          const userName = authData.user.user_metadata?.full_name;

          if (talentData?.length > 0) {
            console.log('Navigating to explore as talent');
            navigate('/explore', { 
              replace: true,
              state: { 
                userName,
                userStatus: 'talent'
              }
            });
          } else if (hmData?.length > 0) {
            console.log('Navigating to jobs as hiring manager');
            navigate('/jobs', { 
              replace: true,
              state: { 
                userName,
                userStatus: 'hiring_manager'
              }
            });
          } else {
            console.log('Navigating to status selection');
            navigate('/select-status', { 
              replace: true,
              state: { 
                userName
              }
            });
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to login. Please try again.'
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-secondary-dark/30 transform -rotate-12" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-secondary-dark/30 transform rotate-12" />
      </div>
      
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl relative z-10 my-8">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Welcome Back</h1>
            <p className="text-dark/70">Sign in to your account</p>
          </div>

          {location.state?.message && (
            <div className="mb-6 p-3 rounded bg-green-50 text-green-600 text-sm text-center">
              {location.state.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              disabled={isLoading}
            />

            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              disabled={isLoading}
            />

            {errors.submit && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-500 text-sm">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-lg text-white font-medium mt-6 
                ${!isLoading ? 'bg-primary hover:opacity-90' : 'bg-primary/50 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-dark/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 