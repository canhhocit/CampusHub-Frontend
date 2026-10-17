import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const RAW_BASE_URL = import.meta.env?.VITE_API_BASE_URL;
const BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.trim().replace(/\/+$/, '') : 'http://localhost:8080';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_STORAGE_KEY = 'campushub_access_token';

let accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
let tokenVersion = 0;

export const setAccessToken = (token: string | null) => {
  tokenVersion++;
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
};

export const getAccessToken = () => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return accessToken;
};

// All callers, including AuthContext bootstrap, share rotation of the HttpOnly cookie.
let refreshPromise: Promise<string> | null = null;
export const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    const startedVersion = tokenVersion;
    refreshPromise = axiosInstance.post('/api/v1/auth/refresh')
      .then(({ data }) => {
        if (tokenVersion !== startedVersion) throw new Error('Session changed during refresh');
        if (typeof data.accessToken !== 'string' || !data.accessToken) {
          throw new Error('Invalid refresh response');
        }
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .catch((error: AxiosError) => {
        if (error.response && [401, 403].includes(error.response.status)) {
          setAccessToken(null);
          window.dispatchEvent(new Event('campushub:session-expired'));
        }
        throw error;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const authEndpoint = originalRequest?.url?.startsWith('/api/v1/auth/')
      && originalRequest.url !== '/api/v1/auth/me';
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || authEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      // A delayed failure may belong to the token that another request already refreshed.
      const currentToken = getAccessToken();
      const usedToken = originalRequest.headers?.Authorization;
      const token = currentToken && usedToken !== `Bearer ${currentToken}`
        ? currentToken
        : await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);
