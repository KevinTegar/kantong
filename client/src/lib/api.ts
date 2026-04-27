import axios from 'axios';
import { supabase } from './supabase';

const getBaseURL = () => {
  // If VITE_API_BASE_URL ends with /api, use it directly
  // Otherwise append /api
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  }
  return 'http://localhost:3001/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);