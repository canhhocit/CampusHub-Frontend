export interface KioskLockerInfo {
  id: number;
  name: string;
  code: string;
  location: string;
  status: string;
}

export interface KioskCompartmentInfo {
  id: number;
  code: string;
  status: string;
}

export interface KioskActionResponse {
  orderId: number;
  orderNumber: string;
  lockerId: number;
  lockerName: string;
  compartmentId: number;
  compartmentCode: string;
  status: string;
  message: string;
  timestamp: string;
}

