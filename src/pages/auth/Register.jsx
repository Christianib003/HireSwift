import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import { supabase } from '../../supabase/supabaseClient';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // 1. Sign up the user
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });

        if (authError) throw authError;

        console.log('Signup response:', data); // Debug log

        // Check if the signup was successful
        if (data?.user) {
          // Sign up was successful
          setIsSuccess(true);
          setRegisteredEmail(formData.email);
          console.log('Registration successful!');
        } else {
          throw new Error('Failed to create user account');
        }

      } catch (error) {
        console.error('Registration error:', error); // Debug log
        setErrors(prev => ({
          ...prev,
          submit: error.message
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 6
    );
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-secondary-dark/30 transform -rotate-12" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-secondary-dark/30 transform rotate-12" />
      </div>
      
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl relative z-10 my-8">
        <div className="p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-dark mb-4">Check Your Email</h2>
              <p className="text-dark/70 mb-8">
                We've sent a confirmation link to your email address. 
                Please check your email and click on the link to activate your account.
              </p>
              <div className="space-y-4">
                <Link 
                  to="/login"
                  className="block text-primary hover:underline"
                >
                  Return to Login
                </Link>
                <p className="text-sm text-dark/50">
                  Didn't receive the email? Check your spam folder or contact support.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-dark mb-2">HireSwift</h1>
                <p className="text-dark/70">Register to Get Started</p>
              </div>

              <form onSubmit={handleSubmit}>
                <FormInput
                  label="Full Name"
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />

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

                <FormInput
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />

                {errors.submit && (
                  <div className="mb-4 p-3 rounded bg-red-50 text-red-500 text-sm">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className={`w-full py-2 rounded-lg text-white font-medium mt-6 
                    ${isFormValid() && !isLoading
                      ? 'bg-primary hover:opacity-90' 
                      : 'bg-primary/50 cursor-not-allowed'
                    } relative`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing up...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>

              <p className="text-center mt-6 text-dark/70">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Log In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register; 