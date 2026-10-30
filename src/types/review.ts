export interface ReviewResponse {
  id: number;
  orderId: number;
  productId: number;
  productTitle: string;
  reviewerId: number;
  reviewerName: string;
  reviewerAvatar?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface UserRatingSummaryResponse {
  userId: number;
  averageRating: number;
  totalReviews: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

export interface ReviewCreateRequest {
  rating: number;
  comment?: string;
}

