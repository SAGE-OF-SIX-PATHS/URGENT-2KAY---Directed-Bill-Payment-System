import { User } from '@prisma/client';

// Use module augmentation instead of namespace declaration
// This helps avoid the type conflict by augmenting the existing type
import 'express';

// Note: Removed the conflicting Express namespace declaration

// Create a type that matches the Express.User definition but can be extended
export type RequestUser = {
  id: string;
  role?: string;
  email?: string;
  // Add any other properties you need to access from req.user
  name?: string;
  phone?: string;
};

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