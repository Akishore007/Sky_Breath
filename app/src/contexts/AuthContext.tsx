import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/apiService';

interface User {
  id: number | string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  location: string;
  language_preference?: string;
  notifications_enabled: boolean;
  temperature_threshold: number;
  humidity_threshold: number;
  wind_speed_threshold: number;
  favorite_channels?: number[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
    location?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          apiService.setToken(token);
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Input validation
      if (!username || !password) {
        throw new Error('Email and password are required');
      }
      
      if (username.length < 3) {
        throw new Error('Email must be at least 3 characters');
      }
      
      console.log('AuthContext: Attempting login for:', username);
      const response = await apiService.login(username, password);
      console.log('AuthContext: Login response received');
      
      if (!response) {
        throw new Error('Empty response from server');
      }
      
      if (!response.user) {
        throw new Error('Invalid response format: user data missing');
      }
      
      setUser(response.user);
      console.log('AuthContext: User authenticated successfully');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      console.error('AuthContext: Login error:', errorMsg, error);
      
      // Provide specific error messages
      let userMessage = errorMsg;
      if (errorMsg.includes('Invalid credentials')) {
        userMessage = 'Email or password is incorrect';
      } else if (errorMsg.includes('not found')) {
        userMessage = 'User account not found';
      } else if (errorMsg.includes('unavailable')) {
        userMessage = 'Server is temporarily unavailable. Please try again later.';
      } else if (errorMsg.includes('timed out')) {
        userMessage = 'Request took too long. Please check your connection and try again.';
      }
      
      throw new Error(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
    location?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Input validation
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }
      
      if (!data.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (data.password !== data.password2) {
        throw new Error('Passwords do not match');
      }
      
      console.log('AuthContext: Attempting registration for:', data.email);
      const response = await apiService.register(data);
      console.log('AuthContext: Registration response received');
      
      if (!response) {
        throw new Error('Empty response from server');
      }
      
      if (!response.user) {
        throw new Error('Invalid response format: user data missing');
      }
      
      setUser(response.user);
      console.log('AuthContext: User registered and authenticated successfully');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed';
      console.error('AuthContext: Registration error:', errorMsg, error);
      
      // Provide specific error messages
      let userMessage = errorMsg;
      if (errorMsg.includes('already exists')) {
        userMessage = 'This email is already registered. Please try logging in instead.';
      } else if (errorMsg.includes('username')) {
        userMessage = 'This username is already taken. Please choose another.';
      } else if (errorMsg.includes('unavailable')) {
        userMessage = 'Server is temporarily unavailable. Please try again later.';
      } else if (errorMsg.includes('timed out')) {
        userMessage = 'Request took too long. Please check your connection and try again.';
      }
      
      throw new Error(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(updates);
      setUser(response);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
