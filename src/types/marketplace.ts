export interface Category {
    id: number;
    name: string;
    slug: string;
}

export type ListingType = 'SALE' | 'RENT' | 'BOTH';

export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'SOLD' | 'RENTED';

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    listingType?: ListingType;
    rentPricePerDay?: number | null;
    depositAmount?: number | null;
    imageUrl: string;
    videoUrl?: string | null;
    detailImageUrls?: string[];
    status: ProductStatus;
    category: Category;
    owner: {
        id: number;
        username?: string;
        fullName: string;
        identityVerified?: boolean;
    };
    createdAt: string;
    updatedAt: string;
    version: number;
}

export interface ProductMediaSettings {
    maxProductImages: number;
    maxProductVideos: number;
    allowProductVideo: boolean;
    maxVideoSizeMb: number;
}

export interface ProductCreatePayload {
    title: string;
    description: string;
    price: number;
    listingType?: ListingType;
    rentPricePerDay?: number | null;
    depositAmount?: number | null;
    imageUrl: string;
    videoUrl?: string | null;
    detailImageUrls?: string[];
    categoryId: number;
}

export interface ProductUpdatePayload {
    title?: string;
    description?: string;
    price?: number;
    listingType?: ListingType;
    rentPricePerDay?: number | null;
    depositAmount?: number | null;
    imageUrl?: string;
    videoUrl?: string | null;
    detailImageUrls?: string[];
    categoryId?: number;
}

export interface PageResponse<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
