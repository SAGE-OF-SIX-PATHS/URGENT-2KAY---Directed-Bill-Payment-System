import { User } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Custom blockchain request type
export interface CustomBlockchainRequest {
  id: string;
  billId: string;
  blockchainBillId?: string;
  beneficiaryAddress: string;
  sponsorAddress: string;
  paymentDestination: string;
  amount: number;
  description: string;
  status: string;
  transactionHash?: string;
  notes?: string;
  paymentType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Data type
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId: string;
  isRead: boolean;
}

// User Metrics type
export interface UserMetrics {
  walletAddress: string;
  pendingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalRewards: number;
}

// Blockchain Status enum
export enum BlockchainRequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED'
} 