import { axiosInstance } from './axios';

export type VerificationAttemptStatus =
  | 'STARTED'
  | 'LIVENESS_IN_PROGRESS'
  | 'LIVENESS_PASSED'
  | 'FACE_VERIFICATION_PASSED'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'EXPIRED';

export type ChallengeAction =
  | 'TURN_HEAD_LEFT'
  | 'TURN_HEAD_RIGHT'
  | 'NOD_HEAD'
  | 'FACE_CENTER';

export interface ChallengeInfo {
  action: ChallengeAction;
  instruction: string;
  timeoutSeconds: number;
}

export interface StartVerificationResponseDto {
  attemptId: string;
  status: VerificationAttemptStatus;
  expiresAt: string;
  currentChallenge: ChallengeInfo;
  totalChallenges: number;
  stepIndex: number;
}

export interface LivenessStepResultDto {
  attemptId: string;
  status: VerificationAttemptStatus;
  stepIndex: number;
  actionCompleted: boolean;
  livenessPassed: boolean;
  nextChallenge?: ChallengeInfo | null;
  message?: string;
}

export interface FaceVerificationResultDto {
  attemptId: string;
  status: VerificationAttemptStatus;
  similarityScore: number;
  threshold: number;
  match: boolean;
  message?: string;
}

export interface IdentityAttemptResponseDto {
  attemptId: string;
  status: VerificationAttemptStatus;
  citizenIdMasked?: string;
  startedAt?: string;
  expiresAt?: string;
  completedAt?: string;
  faceSimilarityScore?: number;
  faceThreshold?: number;
  faceMatched?: boolean;
  livenessPassed?: boolean;
  antiSpoofingOutcome?: string;
  failureCode?: string;
  failureReason?: string;
}

export const identityApi = {
  /**
   * Bước 1: Khởi tạo phiên eKYC bằng ảnh mặt trước thẻ CCCD
   */
  startAttempt: async (cardFile: File): Promise<StartVerificationResponseDto> => {
    const formData = new FormData();
    formData.append('card_file', cardFile, cardFile.name);

    const response = await axiosInstance.post<StartVerificationResponseDto>(
      '/api/v1/identity/attempts/start',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Bước 2: Gửi các frames webcam thực hiện động tác challenge liveness
   */
  submitLivenessStep: async (
    attemptId: string,
    frames: Blob[]
  ): Promise<LivenessStepResultDto> => {
    const formData = new FormData();
    frames.forEach((blob, index) => {
      formData.append('frames', blob, `frame_${index}.jpg`);
    });

    const response = await axiosInstance.post<LivenessStepResultDto>(
      `/api/v1/identity/attempts/${attemptId}/liveness-step`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Bước 3: Đối chiếu khuôn mặt trên CCCD gốc với ảnh selfie chân dung
   */
  verifyFace: async (
    attemptId: string,
    cardFile: File,
    selfieFile: Blob | File
  ): Promise<FaceVerificationResultDto> => {
    const formData = new FormData();
    formData.append('card_file', cardFile, cardFile.name);
    formData.append('selfie_file', selfieFile, 'selfie.jpg');

    const response = await axiosInstance.post<FaceVerificationResultDto>(
      `/api/v1/identity/attempts/${attemptId}/verify-face`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Lấy thông tin phiên định danh theo attemptId
   */
  getAttempt: async (attemptId: string): Promise<IdentityAttemptResponseDto> => {
    const response = await axiosInstance.get<IdentityAttemptResponseDto>(
      `/api/v1/identity/attempts/${attemptId}`
    );
    return response.data;
  },

  /**
   * Lấy phiên định danh gần nhất của tài khoản hiện tại
   */
  getMyLatestAttempt: async (): Promise<IdentityAttemptResponseDto | null> => {
    const response = await axiosInstance.get<IdentityAttemptResponseDto | null>(
      '/api/v1/identity/attempts/me'
    );
    if (response.status === 204 || !response.data) {
      return null;
    }
    return response.data;
  },
};
