export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  targetType?: string | null;
  targetId?: number | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

