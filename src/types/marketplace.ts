export interface Category {
    id: number;
    name: string;
    slug: string;
}

export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'SOLD';

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
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
