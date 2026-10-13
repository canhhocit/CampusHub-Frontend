import { axiosInstance } from './axios';

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

