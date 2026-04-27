import axios from 'axios';
import { supabase } from './supabase';

const LOCAL_API_URL = 'http://localhost:3001/api';

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const getBaseURL = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (baseUrl) {
    return normalizeApiBaseUrl(baseUrl);
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (!isLocalhost) {
      return `${origin}/api`;
    }
  }

  return LOCAL_API_URL;
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
