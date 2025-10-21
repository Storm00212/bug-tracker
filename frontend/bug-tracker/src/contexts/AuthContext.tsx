/**
 * AUTHENTICATION CONTEXT
 *
 * React Context for managing global authentication state.
 * Provides authentication status, user data, and auth methods throughout the app.
 * Uses React Context API for state management and localStorage for persistence.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { User } from '../services/authService';

// TypeScript interface for authentication context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; role: 'Admin' | 'Developer' | 'Tester' }) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface for AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Wraps the entire application to provide authentication state.
 * Manages user session, loading states, and authentication methods.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for user data and loading status
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if user is already authenticated
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        // Clear invalid authentication data
        AuthService.logout();
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * User login method
   * Authenticates user and updates context state
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      throw error; // Re-throw for component-level error handling
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User registration method
   * Creates new account and automatically logs user in
   */
  const register = async (userData: { username: string; email: string; password: string; role: 'Admin' | 'Developer' | 'Tester' }): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(userData);
      setUser(response.user);
    } catch (error) {
      throw error; // Re-throw for component-level error handling
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User logout method
   * Clears authentication data and resets context state
   */
  const logout = (): void => {
    AuthService.logout();
    setUser(null);
  };

  /**
   * Check if user has specific role
   * Used for role-based UI rendering and access control
   */
  const hasRole = (role: string): boolean => {
    return AuthService.hasRole(role);
  };

  /**
   * Check if current user is admin
   * Convenience method for admin-only features
   */
  const isAdmin = (): boolean => {
    return AuthService.isAdmin();
  };

  // Context value object
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for using authentication context
 *
 * Must be used within an AuthProvider component.
 * Provides access to authentication state and methods.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};