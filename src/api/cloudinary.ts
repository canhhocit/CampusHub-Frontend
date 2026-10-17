import { axiosInstance, BASE_URL } from './axios';

export interface CloudinaryUploadResult {
  url: string;
}

/**
 * Tải ảnh lên hệ thống qua máy chủ Backend (Backend sẽ lưu lên Cloudinary an toàn bằng API Key / Secret).
 * Frontend không cần cấu hình Cloudinary credentials hay unsigned upload preset.
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // 1. Kiểm tra định dạng ảnh
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Định dạng ảnh không hỗ trợ. Vui lòng chọn ảnh định dạng JPG, PNG, WEBP hoặc GIF.');
  }

  // 2. Kiểm tra dung lượng (tối đa 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Dung lượng ảnh vượt quá giới hạn 10MB. Vui lòng chọn ảnh nhẹ hơn.');
  }

  // 3. Chuẩn bị multipart form-data
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post<{ url: string }>('/api/v1/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data?.url) {
      throw new Error('Không nhận được đường dẫn ảnh từ máy chủ.');
    }

    return response.data.url;
  } catch (error: any) {
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
      throw new Error(serverMessage);
    }
    throw error;
  }
};

/**
 * Tải video lên hệ thống qua máy chủ Backend (lưu lên Cloudinary hoặc local /uploads/).
 */
export const uploadVideoToCloudinary = async (file: File): Promise<string> => {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Định dạng video không hỗ trợ. Vui lòng chọn định dạng MP4, WebM hoặc MOV.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post<{ url: string }>('/api/v1/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data?.url) {
      throw new Error('Không nhận được đường dẫn video từ máy chủ.');
    }

    return response.data.url;
  } catch (error: any) {
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
      throw new Error(serverMessage);
    }
    throw error;
  }
};

/**
 * Chuẩn hóa URL hiển thị ảnh/video (hỗ trợ cả link Cloudinary https://... lẫn local fallback /uploads/...)
 */
export const getMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const base = (BASE_URL || '').replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};


