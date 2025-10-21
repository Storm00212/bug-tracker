/**
 * REGISTER PAGE COMPONENT
 *
 * User registration page with form validation.
 * Allows new users to create accounts with role selection.
 * Includes form validation and error handling.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Bug } from 'lucide-react';
import toast from 'react-hot-toast';

// Form validation schema
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(4, 'Password must be at least 4 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Admin', 'Developer', 'Tester']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success('Registration successful! Welcome to Bug Tracker!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Bug className="h-6 w-6 text-primary-content" />
          </div>
          <h2 className="text-3xl font-bold text-base-content">Create Account</h2>
          <p className="mt-2 text-sm text-base-content/70">
            Join Bug Tracker to start managing your projects
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-base-100 shadow-xl rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-base-content">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  errors.username ? 'border-error' : 'border-base-300'
                }`}
                {...register('username')}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-error">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-base-content">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  errors.email ? 'border-error' : 'border-base-300'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-base-content">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.password ? 'border-error' : 'border-base-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-base-content/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-base-content/50" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-base-content">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.confirmPassword ? 'border-error' : 'border-base-300'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-base-content/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-base-content/50" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-base-content mb-2">
                Role
              </label>
              <select
                id="role"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  errors.role ? 'border-error' : 'border-base-300'
                }`}
                {...register('role')}
              >
                <option value="">Select a role</option>
                <option value="Tester">Tester</option>
                <option value="Developer">Developer</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-error">{errors.role.message}</p>
              )}
              <p className="mt-1 text-xs text-base-content/60">
                Select the role that best describes your responsibilities
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-content bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-content border-t-transparent mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-focus"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;