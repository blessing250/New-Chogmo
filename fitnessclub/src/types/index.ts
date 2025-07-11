export interface User {
  id: string;
  _id?: string; // For MongoDB compatibility
  email: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  membership?: string;
  membershipExpiry?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  type: "sauna" | "gym" | "massage";
  duration: string;
  sessions: number;
  price: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPackage {
  id: string;
  userId: string;
  packageId: string;
  remainingSessions: number;
  totalSessions: number;
  purchaseDate: Date;
  expiryDate: Date;
  isActive: boolean;
  paymentStatus: "pending" | "completed" | "refunded";
}

export interface Appointment {
  id: string;
  userId: string;
  packageId: string;
  serviceType: "sauna" | "gym" | "massage";
  date: Date;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: Date;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  packageId: string;
  serviceType: "sauna" | "gym" | "massage";
  checkInTime: Date;
  checkOutTime?: Date;
  sessionUsed: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
}
