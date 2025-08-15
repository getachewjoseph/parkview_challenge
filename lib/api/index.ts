import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL configuration
const getApiUrl = () => {
  if (Platform.OS === 'ios') {
    // For iOS simulator
    return 'http://127.0.0.1:3001/api';
  } else if (Platform.OS === 'android') {
    // For Android emulator
    return 'http://10.0.2.2:3001/api';
  } else {
    // For web or other platforms
    return 'http://localhost:3001/api';
  }
};

const API_URL = getApiUrl();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
  userType: 'patient' | 'caretaker';
  referralCode?: string;
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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        return data;
      }
      throw new Error('No token received');
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async register(credentials: RegisterCredentials) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        return data;
      }
      throw new Error('No token received');
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async logout() {
    await AsyncStorage.removeItem('token');
  },

  async getToken() {
    return await AsyncStorage.getItem('token');
  },

  async getMe() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async submitScreening(answers: ScreeningAnswers) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/screening`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(answers),
    });
    return await handleResponse(response);
  },
  
  async getReferralCode() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/auth/referral-code`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async updateReferralCode(newCode: string) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/auth/referral-code`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referralCode: newCode }),
    });
    return await handleResponse(response);
  },

  async linkCaretaker(referralCode: string) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/link-caretaker`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referralCode }),
    });
    return await handleResponse(response);
  },

  async getPatients() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/patients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getPatientDetails(patientId: number) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getFallLog() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/falls`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async logFall(fallData: any) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/falls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fallData),
    });
    return await handleResponse(response);
  },

  async submitExercise({ weekStart, minutes }: { weekStart: string, minutes: number }) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/exercise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ weekStart, minutes }),
    });
    return await handleResponse(response);
  },

  async getPatientExercise(patientId: number) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/patients/${patientId}/exercise`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getCurrentWeekExercise(weekStart: string) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const url = weekStart ? `${API_URL}/users/me/exercise?weekStart=${weekStart}` : `${API_URL}/users/me/exercise`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getAllExerciseLogs() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/exercise`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getFavorites() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/tai-chi/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async addFavorite(locationId: number) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/tai-chi/favorites/${locationId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async removeFavorite(locationId: number) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/tai-chi/favorites/${locationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getAnalytics() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },

  async getPatientAnalytics(patientId: number) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/me/patients/${patientId}/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(response);
  },
};