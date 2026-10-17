import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { axiosInstance, setAccessToken, getAccessToken, refreshAccessToken } from '../api/axios';

interface User {
  username: string;
  role: string;
  identityVerified?: boolean;
  identityReviewStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  citizenId?: string | null;
  fullName?: string;
  email?: string;
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hasInitializedRef = useRef(false);

  const fetchUser = async (): Promise<boolean> => {
    try {
      const response = await axiosInstance.get('/api/v1/auth/me');
      const authorities = response.data.authorities;
      const role = authorities && authorities.length > 0 ? authorities[0].authority : '';
      const identityVerified = Boolean(response.data.identityVerified);
      setUser({
        username: response.data.username,
        role,
        identityVerified,
        identityReviewStatus: response.data.identityReviewStatus,
        fullName: response.data.fullName,
        email: response.data.email,
        citizenId: response.data.citizenId,
      });
      setIsAuthenticated(true);
      return true;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const initializeAuth = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await fetchUser(); // Its API request already performs the single refresh retry.
        return;
      }

      // Attempt to refresh token if no token or token expired
      await refreshAccessToken();
      await fetchUser();
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    initializeAuth();
  }, []);

  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('campushub:session-expired', onExpired);
    return () => window.removeEventListener('campushub:session-expired', onExpired);
  }, [queryClient]);

  const login = async (data: any) => {
    const response = await axiosInstance.post('/api/v1/auth/login', data);
    queryClient.clear();
    setAccessToken(response.data.accessToken);
    if (!await fetchUser()) throw new Error('Không thể tải thông tin tài khoản');
  };

  const register = async (data: any) => {
    await axiosInstance.post('/api/v1/auth/register', data);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout');
    } finally {
      setAccessToken(null);
      queryClient.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const verifyEmail = useCallback(async (token: string) => {
    await axiosInstance.post('/api/v1/auth/verify-email', { token });
  }, []);

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
        refreshUser: async () => {
          await fetchUser();
        },
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
