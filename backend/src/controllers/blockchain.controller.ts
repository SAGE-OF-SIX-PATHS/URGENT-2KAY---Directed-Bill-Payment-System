import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import blockchainService from '../services/blockchain.service';

const prisma = new PrismaClient();

export const createWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create or get existing wallet
    const wallet = await blockchainService.createUserWallet(userId);

    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
};

export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get user wallet
    const wallet = await prisma.cryptoWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    // Get token balance
    const balance = await blockchainService.getTokenBalance(wallet.address);

    res.status(200).json({ 
      address: wallet.address,
      balance
    });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
};

export const connectExistingWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { walletAddress } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Connect existing wallet
    const wallet = await blockchainService.connectExistingWallet(userId, walletAddress);

    res.status(200).json({
      success: true,
      wallet,
      message: 'Existing wallet connected successfully'
    });
  } catch (error: any) {
    console.error('Error connecting existing wallet:', error);
    res.status(500).json({ error: error.message || 'Failed to connect existing wallet' });
  }
};

export const createBillRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { billId } = req.params;
    const { beneficiaryAddress, sponsorAddress, paymentDestination, amount, description } = req.body;

    if (!billId || !beneficiaryAddress || !sponsorAddress || !paymentDestination || !amount || !description) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if bill exists
    const bill = await prisma.bill.findUnique({
      where: { id: billId }
    });

    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    // Check if blockchain request already exists
    const existingRequest = await prisma.blockchainRequest.findUnique({
      where: { billId }
    });

    if (existingRequest) {
      res.status(400).json({ error: 'Blockchain request already exists for this bill' });
      return;
    }

    // Create bill request on blockchain
    const transactionHash = await blockchainService.createBillRequest(
      billId,
      beneficiaryAddress,
      sponsorAddress,
      paymentDestination,
      amount,
      description
    );

    res.status(201).json({ 
      success: true, 
      transactionHash,
      message: 'Bill request created successfully on blockchain'
    });
  } catch (error) {
    console.error('Error creating bill request:', error);
    res.status(500).json({ error: 'Failed to create bill request' });
  }
};

export const payBillWithNative = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockchainRequestId } = req.params;
    const { sponsorPrivateKey, amount } = req.body;

    if (!blockchainRequestId || !sponsorPrivateKey || !amount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get blockchain request
    const blockchainRequest = await prisma.blockchainRequest.findUnique({
      where: { id: blockchainRequestId }
    });

    if (!blockchainRequest) {
      res.status(404).json({ error: 'Blockchain request not found' });
      return;
    }
    
    // We need to find the blockchain bill ID that corresponds to this request
    // This is likely stored in an event during createBillRequest, so we could
    // either retrieve it from a mapping in the contract or look it up in our own records
    
    // For now, let's assume the blockchain request stores the billId and we can use the hash
    // to find the blockchain bill ID by examining transaction receipts
    
    // But for simplicity, we'll assume the billId from our database maps to the blockchain billId
    // In a real implementation, you would need to implement proper mapping
    
    // Pay bill with native tokens (assuming billId maps to blockchainBillId)
    const transactionHash = await blockchainService.payBillWithNative(
      // This is a simplification - you'd need to implement proper mapping
      blockchainRequest.billId, // Use as blockchain bill ID or implement proper lookup
      sponsorPrivateKey,
      amount
    );

    // Update database status
    await prisma.blockchainRequest.update({
      where: { id: blockchainRequestId },
      data: { 
        status: 'CONFIRMED',
        transactionHash
      }
    });

    // Update bill status
    await prisma.bill.update({
      where: { id: blockchainRequest.billId },
      data: { status: 'PAID' }
    });

    res.status(200).json({ 
      success: true, 
      transactionHash,
      message: 'Bill paid successfully with native tokens'
    });
  } catch (error) {
    console.error('Error paying bill with native tokens:', error);
    res.status(500).json({ error: 'Failed to pay bill with native tokens' });
  }
};

export const payBillWithU2K = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockchainRequestId } = req.params;
    const { sponsorPrivateKey } = req.body;

    if (!blockchainRequestId || !sponsorPrivateKey) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get blockchain request
    const blockchainRequest = await prisma.blockchainRequest.findUnique({
      where: { id: blockchainRequestId }
    });

    if (!blockchainRequest) {
      res.status(404).json({ error: 'Blockchain request not found' });
      return;
    }

    // Pay bill with U2K tokens (assuming billId maps to blockchainBillId)
    const transactionHash = await blockchainService.payBillWithU2K(
      // This is a simplification - you'd need to implement proper mapping
      blockchainRequest.billId, // Use as blockchain bill ID or implement proper lookup
      sponsorPrivateKey
    );

    // Update database status
    await prisma.blockchainRequest.update({
      where: { id: blockchainRequestId },
      data: { 
        status: 'CONFIRMED',
        transactionHash,
        paymentType: 'U2K_TOKEN'
      }
    });

    // Update bill status
    await prisma.bill.update({
      where: { id: blockchainRequest.billId },
      data: { status: 'PAID' }
    });

    res.status(200).json({ 
      success: true, 
      transactionHash,
      message: 'Bill paid successfully with U2K tokens'
    });
  } catch (error) {
    console.error('Error paying bill with U2K tokens:', error);
    res.status(500).json({ error: 'Failed to pay bill with U2K tokens' });
  }
};

export const rejectBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockchainRequestId } = req.params;
    const { sponsorPrivateKey } = req.body;

    if (!blockchainRequestId || !sponsorPrivateKey) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get blockchain request
    const blockchainRequest = await prisma.blockchainRequest.findUnique({
      where: { id: blockchainRequestId }
    });

    if (!blockchainRequest) {
      res.status(404).json({ error: 'Blockchain request not found' });
      return;
    }

    // Reject bill (assuming billId maps to blockchainBillId)
    const transactionHash = await blockchainService.rejectBill(
      // This is a simplification - you'd need to implement proper mapping
      blockchainRequest.billId, // Use as blockchain bill ID or implement proper lookup
      sponsorPrivateKey
    );

    // Update database status
    await prisma.blockchainRequest.update({
      where: { id: blockchainRequestId },
      data: { 
        status: 'REJECTED',
        transactionHash
      }
    });

    // Update bill status
    await prisma.bill.update({
      where: { id: blockchainRequest.billId },
      data: { status: 'FAILED' }
    });

    res.status(200).json({ 
      success: true, 
      transactionHash,
      message: 'Bill rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting bill:', error);
    res.status(500).json({ error: 'Failed to reject bill' });
  }
};

export const getBillDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockchainBillId } = req.params;

    if (!blockchainBillId) {
      res.status(400).json({ error: 'Blockchain bill ID is required' });
      return;
    }

    // Get bill details from blockchain
    const bill = await blockchainService.getBillDetails(blockchainBillId);

    res.status(200).json(bill);
  } catch (error) {
    console.error('Error getting bill details:', error);
    res.status(500).json({ error: 'Failed to get bill details' });
  }
};

export const getBeneficiaryBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;

    if (!address) {
      res.status(400).json({ error: 'Beneficiary address is required' });
      return;
    }

    // Get beneficiary bills from blockchain
    const bills = await blockchainService.getBeneficiaryBills(address);

    res.status(200).json({ bills });
  } catch (error) {
    console.error('Error getting beneficiary bills:', error);
    res.status(500).json({ error: 'Failed to get beneficiary bills' });
  }
};

export const getSponsorBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;

    if (!address) {
      res.status(400).json({ error: 'Sponsor address is required' });
      return;
    }

    // Get sponsor bills from blockchain
    const bills = await blockchainService.getSponsorBills(address);

    res.status(200).json({ bills });
  } catch (error) {
    console.error('Error getting sponsor bills:', error);
    res.status(500).json({ error: 'Failed to get sponsor bills' });
  }
}; 