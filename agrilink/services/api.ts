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

// API service for demands
export const demandAPI = {
  // Create a new demand
  createDemand: async (demandData: {
    productType: string;
    productName: string;
    quantity: string;
    deliveryDate: string;
    deliveryLocation: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }) => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/demands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(demandData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create demand');
      }

      return data;
    } catch (error) {
      console.error('Create demand API error:', error);
      throw error;
    }
  },

  // Get all demands (for sellers)
  getDemands: async (filters?: {
    productType?: string;
    status?: string;
  }) => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = `${API_URL}/api/demands`;
      const params = new URLSearchParams();

      if (filters?.productType) {
        params.append('productType', filters.productType);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch demands');
      }

      return data;
    } catch (error) {
      console.error('Get demands API error:', error);
      throw error;
    }
  },

  // Get user's own demands
  getMyDemands: async () => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/demands/my-demands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch my demands');
      }

      return data;
    } catch (error) {
      console.error('Get my demands API error:', error);
      throw error;
    }
  },

  // Respond to a demand (for sellers)
  respondToDemand: async (demandId: string, responseData: {
    message: string;
    price?: number;
    contactInfo?: string;
  }) => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/demands/${demandId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(responseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to respond to demand');
      }

      return data;
    } catch (error) {
      console.error('Respond to demand API error:', error);
      throw error;
    }
  },

  // Update demand status
  updateDemandStatus: async (demandId: string, status: 'active' | 'fulfilled' | 'cancelled') => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/demands/${demandId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update demand');
      }

      return data;
    } catch (error) {
      console.error('Update demand API error:', error);
      throw error;
    }
  },
};

// API service for postings
export const postingAPI = {
  // Create a new posting
  createPosting: async (postingData: {
    title: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
  }) => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/postings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(postingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create posting');
      }

      return data;
    } catch (error) {
      console.error('Create posting API error:', error);
      throw error;
    }
  },

  // Get all postings
  getPostings: async (filters?: {
    category?: string;
    sellerId?: string;
    search?: string;
  }) => {
    try {
      let url = `${API_URL}/api/postings`;
      const params = new URLSearchParams();

      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.sellerId) {
        params.append('sellerId', filters.sellerId);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch postings');
      }

      return data;
    } catch (error) {
      console.error('Get postings API error:', error);
      throw error;
    }
  },

  // Get seller's own postings
  getMyPostings: async () => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userData = await storage.getUserData();
      if (!userData?.user?._id) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`${API_URL}/api/postings?sellerId=${userData.user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch my postings');
      }

      return data;
    } catch (error) {
      console.error('Get my postings API error:', error);
      throw error;
    }
  },

  // Get single posting
  getPosting: async (postingId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/postings/${postingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posting');
      }

      return data;
    } catch (error) {
      console.error('Get posting API error:', error);
      throw error;
    }
  },

  // Update posting
  updatePosting: async (postingId: string, postingData: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    images?: string[];
    active?: boolean;
  }) => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/postings/${postingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(postingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update posting');
      }

      return data;
    } catch (error) {
      console.error('Update posting API error:', error);
      throw error;
    }
  },

  // Delete posting
  deletePosting: async (postingId: string) => {
    try {
      const token = await storage.getUserToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/postings/${postingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete posting');
      }

      return data;
    } catch (error) {
      console.error('Delete posting API error:', error);
      throw error;
    }
  },
};
