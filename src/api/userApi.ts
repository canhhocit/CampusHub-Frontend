import { axiosInstance } from './axios';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  dateOfBirth: string | null;
  identityVerified: boolean;
  identityReviewStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  citizenId: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  identityVerifiedAt: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const res = await axiosInstance.get('/api/v1/users/me');
    return res.data;
  },

  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const res = await axiosInstance.put('/api/v1/users/me', data);
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.post('/api/v1/auth/change-password', data);
  },
};
