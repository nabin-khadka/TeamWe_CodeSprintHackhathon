import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://agrilink.tech';

// API service for authentication
export const authAPI = {
  // Register user
  register: async (userData: {
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address?: string;
    profileImage?: string;
    userType?: 'buyer' | 'seller';
  }) => {
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials: { phone: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Logout failed');
      }

      return data;
    } catch (error) {
      console.error('Logout API error:', error);
      throw error;
    }
  },
};

// Storage utilities for managing user session
export const storage = {
  // Save user data to storage
  saveUserData: async (data: any) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      await AsyncStorage.setItem('userToken', data.token);
    } catch (error) {
      console.error('Save user data error:', error);
    }
  },

  // Get user data from storage
  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },

  // Get user token
  getUserToken: async () => {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Get user token error:', error);
      return null;
    }
  },

  // Clear user data
  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove(['userData', 'userToken']);
    } catch (error) {
      console.error('Clear user data error:', error);
    }
  },
};
