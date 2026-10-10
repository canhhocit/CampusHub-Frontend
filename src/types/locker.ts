export type LockerStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

export type CompartmentStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'ERROR' | 'OUT_OF_SERVICE';

export interface Locker {
    id: number;
    code: string;
    name: string;
    location: string;
    status: LockerStatus;
    createdAt: string;
    updatedAt: string;
    totalCompartments: number;
    availableCompartments: number;
    occupiedCompartments: number;
}

export interface Compartment {
    id: number;
    lockerId: number;
    code: string;
    status: CompartmentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CompartmentSummary {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    error: number;
    outOfService: number;
}

export interface LockerDetail {
    id: number;
    code: string;
    name: string;
    location: string;
    status: LockerStatus;
    createdAt: string;
    updatedAt: string;
    compartmentSummary: CompartmentSummary;
    compartments: Compartment[];
}
