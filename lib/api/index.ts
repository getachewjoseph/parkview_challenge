import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL configuration
const getApiUrl = () => {
  if (Platform.OS === 'ios') {
    // For iOS simulator
    return 'http://127.0.0.1:3000/api';
  } else if (Platform.OS === 'android') {
    // For Android emulator
    return 'http://10.0.2.2:3000/api';
  } else {
    // For web or other platforms
    return 'http://localhost:3000/api';
  }
};

const API_URL = getApiUrl();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  userType: 'patient' | 'caretaker';
}

export interface ScreeningAnswers {
  unsteady: boolean;
  worries: boolean;
  fallen: boolean;
  fallCount?: string;
  fallInjured?: string;
}

const handleResponse = async (response: Response) => {
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  
  const text = await response.text();
  console.log('Response text:', text);
  
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    const data = JSON.parse(text);
    
    // Handle authentication errors
    if (response.status === 400 && data.error === 'Invalid credentials') {
      throw new Error('Invalid email or password');
    }
    
    // Handle other error responses
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (e) {
    if (e instanceof Error) {
      throw e; // Re-throw if it's already an Error object
    }
    console.error('Response parsing error:', e);
    console.error('Raw response:', text);
    throw new Error('Invalid response from server');
  }
};

export const api = {
  async login(credentials: LoginCredentials) {
    try {
      console.log('Attempting login with:', { ...credentials, password: '[REDACTED]' });
      console.log('API URL:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      console.log('Login response data:', { ...data, token: data.token ? '[REDACTED]' : null });
      
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        return data;
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async register(credentials: RegisterCredentials) {
    try {
      console.log('Attempting registration with:', { ...credentials, password: '[REDACTED]' });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      console.log('Registration response data:', { ...data, token: data.token ? '[REDACTED]' : null });
      
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        return data;
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  async submitScreening(answers: ScreeningAnswers) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`${API_URL}/screening`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(answers),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Submit screening error:', error);
      throw error;
    }
  },
};