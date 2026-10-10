import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { axiosInstance, setAccessToken } from '../api/axios';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/auth/me');
      const authorities = response.data.authorities;
      const role = authorities && authorities.length > 0 ? authorities[0].authority : '';
      setUser({ username: response.data.username, role });
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const initializeAuth = async () => {
    try {
      // Attempt to refresh token on initial load
      const response = await axiosInstance.post('/api/v1/auth/refresh');
      setAccessToken(response.data.accessToken);
      await fetchUser();
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (data: any) => {
    const response = await axiosInstance.post('/api/v1/auth/login', data);
    setAccessToken(response.data.accessToken);
    await fetchUser();
  };

  const register = async (data: any) => {
    await axiosInstance.post('/api/v1/auth/register', data);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const verifyEmail = async (token: string) => {
    await axiosInstance.post('/api/v1/auth/verify-email', { token });
  };

  const forgotPassword = async (email: string) => {
    await axiosInstance.post('/api/v1/auth/forgot-password', { email });
  };

  const resetPassword = async (data: any) => {
    await axiosInstance.post('/api/v1/auth/reset-password', data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
