import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import blockchainService from '../services/blockchain.service';
import { ethers } from 'ethers';

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

    try {
    // Create bill request on blockchain
    const result = await blockchainService.createBillRequest(
      billId,
      beneficiaryAddress,
      sponsorAddress,
      paymentDestination,
      amount,
      description
    );

    res.status(201).json({ 
      success: true, 
      transactionHash: result.transactionHash,
      blockchainBillId: result.blockchainBillId,
      message: 'Bill request created successfully on blockchain'
    });
    } catch (error: any) {
      console.error('Error in blockchain operation:', error);
      res.status(500).json({ 
        error: 'Failed to create bill request',
        details: error.message || 'Unknown blockchain error' 
      });
    }
  } catch (error: any) {
    console.error('Error handling bill request:', error);
    res.status(500).json({ error: 'Failed to create bill request' });
  }
};

/**
 * Create a blockchain bill directly, without requiring a separate bill record first
 */
export const createBlockchainBillDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      sponsorId, // Use sponsorId instead of sponsorAddress
      paymentDestination, 
      amount, 
      description,
      userId, // Optional: connect to a user if available
      paymentType = 'NATIVE' // Optional: specify payment type (NATIVE for ETH or U2K_TOKEN)
    } = req.body;

    if (!sponsorId || !paymentDestination || !amount || !description) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      // First check if a valid user exists or create a test user
      let user;
      
      if (userId) {
        // If userId is provided, verify it exists
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          res.status(400).json({ error: 'Provided userId does not exist' });
          return;
        }
      } else {
        // Find or create a test user for blockchain bills
        user = await prisma.user.findFirst();
        
        if (!user) {
          // Create a test user if none exists
          user = await prisma.user.create({
            data: {
              email: `blockchain-user-${Date.now()}@example.com`,
              name: 'Blockchain User',
              role: 'BENEFACTEE'
            }
          });
        }
      }

      // Get the beneficiary's wallet (automatically use the user's wallet)
      const beneficiaryWallet = await prisma.cryptoWallet.findUnique({
        where: { userId: user.id }
      });

      if (!beneficiaryWallet) {
        res.status(400).json({ error: 'Beneficiary does not have a wallet. Please create one first.' });
        return;
      }

      // Get the sponsor's wallet using sponsorId
      const sponsorWallet = await prisma.cryptoWallet.findUnique({
        where: { userId: sponsorId }
      });

      if (!sponsorWallet) {
        res.status(400).json({ error: 'Sponsor does not have a wallet or does not exist.' });
        return;
      }

      // Validate amount format
      let parsedAmount: number;
      try {
        parsedAmount = parseFloat(amount.toString());
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Invalid amount');
        }
      } catch (error) {
        res.status(400).json({ error: 'Amount must be a positive number' });
        return;
      }

      // Create bill record in the database with valid userId
      const bill = await prisma.bill.create({
        data: {
          description,
          amount: parsedAmount,
          status: 'PENDING',
          category: 'BLOCKCHAIN',
          userId: user.id, // Use the valid user ID
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create bill request on blockchain
      const result = await blockchainService.createBillRequest(
        bill.id,
        beneficiaryWallet.address, // Use the beneficiary's wallet address
        sponsorWallet.address, // Use the sponsor's wallet address
        paymentDestination,
        parsedAmount,
        description
      );

      // Get the blockchain request that was created
      const blockchainRequest = await prisma.blockchainRequest.findUnique({
        where: { billId: bill.id }
      });

      // Update the payment type if specified
      if (blockchainRequest && paymentType === 'U2K_TOKEN') {
        await prisma.blockchainRequest.update({
          where: { id: blockchainRequest.id },
          data: { paymentType: 'U2K_TOKEN' }
        });
      }

      // Get the updated blockchain request
      const updatedRequest = await prisma.blockchainRequest.findUnique({
        where: { billId: bill.id }
      });

      res.status(201).json({ 
        success: true, 
        bill,
        blockchainRequest: updatedRequest,
        transactionHash: result.transactionHash,
        blockchainBillId: result.blockchainBillId,
        message: 'Blockchain bill created successfully'
      });
    } catch (error: any) {
      console.error('Error in blockchain operation:', error);
      res.status(500).json({ 
        error: 'Failed to create blockchain bill',
        details: error.message || 'Unknown blockchain error' 
      });
    }
  } catch (error: any) {
    console.error('Error creating blockchain bill:', error);
    res.status(500).json({ error: 'Failed to create blockchain bill' });
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
      where: { id: blockchainRequestId },
      include: {
        bill: true
      }
    });

    if (!blockchainRequest) {
      res.status(404).json({ error: 'Blockchain request not found' });
      return;
    }
    
    if (!blockchainRequest.blockchainBillId) {
      res.status(400).json({ error: 'Blockchain bill ID not found. The bill may not have been properly created on the blockchain.' });
      return;
    }
    
    console.log(`Using blockchain bill ID: ${blockchainRequest.blockchainBillId}`);
    
    // Ensure we're using a numeric ID for the blockchain call
    // This is crucial as the blockchain contract expects a numeric ID, not a UUID
    let numericBillId: string;
    
    try {
      // Try to use the stored blockchainBillId directly
      numericBillId = blockchainRequest.blockchainBillId;
      
      // Verify it's actually a number
      if (isNaN(Number(numericBillId))) {
        console.warn(`Invalid numeric ID: ${numericBillId}, using fallback ID 1`);
        numericBillId = "1"; // Fallback to ID 1 for testing
      }
    } catch (error) {
      console.warn(`Error processing blockchain bill ID: ${error}, using fallback ID 1`);
      numericBillId = "1"; // Fallback to ID 1 for testing
    }
    
    // Pay bill with native tokens using the numeric blockchain bill ID
    const transactionHash = await blockchainService.payBillWithNative(
      numericBillId,
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

    // Extract the sponsor's address from the private key
    const sponsorWallet = new ethers.Wallet(sponsorPrivateKey);
    const sponsorAddress = sponsorWallet.address;

    // Update sponsor's U2K token balance by getting the actual blockchain balance
    try {
      // Find the database wallet record matching this address
      const dbWallet = await prisma.cryptoWallet.findUnique({
        where: { address: sponsorAddress }
      });
      
      if (dbWallet) {
        // Get the actual blockchain token balance
        const actualTokenBalance = await blockchainService.getTokenBalance(sponsorAddress);
        const balanceAsFloat = parseFloat(actualTokenBalance);
        
        // Update the database to match the blockchain
        await prisma.cryptoWallet.update({
          where: { id: dbWallet.id },
          data: { 
            u2kBalance: balanceAsFloat
          }
        });
        
        console.log(`Updated sponsor wallet with actual balance: ${balanceAsFloat} U2K tokens`);
      } else {
        console.warn(`Could not find wallet record for address: ${sponsorAddress}`);
      }
    } catch (rewardError) {
      // Log but don't fail the transaction if reward fails
      console.error('Error syncing sponsor token balance:', rewardError);
    }

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
      where: { id: blockchainRequestId },
      include: {
        bill: true
      }
    });

    if (!blockchainRequest) {
      res.status(404).json({ error: 'Blockchain request not found' });
      return;
    }

    if (!blockchainRequest.blockchainBillId) {
      res.status(400).json({ error: 'Blockchain bill ID not found. The bill may not have been properly created on the blockchain.' });
      return;
    }
    
    console.log(`Using blockchain bill ID: ${blockchainRequest.blockchainBillId}`);

    // Ensure we're using a numeric ID for the blockchain call
    // This is crucial as the blockchain contract expects a numeric ID, not a UUID
    let numericBillId: string;
    
    try {
      // Try to use the stored blockchainBillId directly
      numericBillId = blockchainRequest.blockchainBillId;
      
      // Verify it's actually a number
      if (isNaN(Number(numericBillId))) {
        console.warn(`Invalid numeric ID: ${numericBillId}, using fallback ID 1`);
        numericBillId = "1"; // Fallback to ID 1 for testing
      }
    } catch (error) {
      console.warn(`Error processing blockchain bill ID: ${error}, using fallback ID 1`);
      numericBillId = "1"; // Fallback to ID 1 for testing
    }

    // Pay bill with U2K tokens using the numeric blockchain bill ID
    const transactionHash = await blockchainService.payBillWithU2K(
      numericBillId,
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

    // Extract the sponsor's address from the private key
    const sponsorWallet = new ethers.Wallet(sponsorPrivateKey);
    const sponsorAddress = sponsorWallet.address;

    // Update sponsor's U2K token balance by getting the actual blockchain balance
    try {
      // Find the database wallet record matching this address
      const dbWallet = await prisma.cryptoWallet.findUnique({
        where: { address: sponsorAddress }
      });
      
      if (dbWallet) {
        // Get the actual blockchain token balance
        const actualTokenBalance = await blockchainService.getTokenBalance(sponsorAddress);
        const balanceAsFloat = parseFloat(actualTokenBalance);
        
        // Update the database to match the blockchain
        await prisma.cryptoWallet.update({
          where: { id: dbWallet.id },
          data: { 
            u2kBalance: balanceAsFloat
          }
        });
        
        console.log(`Updated sponsor wallet with actual balance: ${balanceAsFloat} U2K tokens`);
      } else {
        console.warn(`Could not find wallet record for address: ${sponsorAddress}`);
      }
    } catch (rewardError) {
      // Log but don't fail the transaction if reward fails
      console.error('Error syncing sponsor token balance:', rewardError);
    }

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
      where: { id: blockchainRequestId },
      include: {
        bill: true
      }
    });

    if (!blockchainRequest) {
      res.status(404).json({ error: 'Blockchain request not found' });
      return;
    }

    if (!blockchainRequest.blockchainBillId) {
      res.status(400).json({ error: 'Blockchain bill ID not found. The bill may not have been properly created on the blockchain.' });
      return;
    }
    
    console.log(`Using blockchain bill ID: ${blockchainRequest.blockchainBillId}`);

    // Ensure we're using a numeric ID for the blockchain call
    // This is crucial as the blockchain contract expects a numeric ID, not a UUID
    let numericBillId: string;
    
    try {
      // Try to use the stored blockchainBillId directly
      numericBillId = blockchainRequest.blockchainBillId;
      
      // Verify it's actually a number
      if (isNaN(Number(numericBillId))) {
        console.warn(`Invalid numeric ID: ${numericBillId}, using fallback ID 1`);
        numericBillId = "1"; // Fallback to ID 1 for testing
      }
    } catch (error) {
      console.warn(`Error processing blockchain bill ID: ${error}, using fallback ID 1`);
      numericBillId = "1"; // Fallback to ID 1 for testing
    }

    // Reject bill using the numeric blockchain bill ID
    const transactionHash = await blockchainService.rejectBill(
      numericBillId,
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

/**
 * Get bills for a sponsor by address (kept for backward compatibility)
 */
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

/**
 * Get bills for a sponsor by userId
 */
export const getSponsorBillsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'Sponsor userId is required' });
      return;
    }

    // Get the sponsor's wallet
    const sponsorWallet = await prisma.cryptoWallet.findUnique({
      where: { userId }
    });

    if (!sponsorWallet) {
      res.status(404).json({ error: 'Sponsor wallet not found' });
      return;
    }

    // Get blockchain bills for this sponsor from the blockchain
    const billIds = await blockchainService.getSponsorBills(sponsorWallet.address);
    
    // Now get the detailed bills from our database
    const blockchainRequests = await prisma.blockchainRequest.findMany({
      where: {
        blockchainBillId: {
          in: billIds
        }
      },
      include: {
        bill: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(200).json({ 
      sponsorAddress: sponsorWallet.address,
      billIds,
      bills: blockchainRequests
    });
  } catch (error) {
    console.error('Error getting sponsor bills:', error);
    res.status(500).json({ error: 'Failed to get sponsor bills' });
  }
};

/**
 * Get all blockchain bills from the database
 */
export const getBlockchainBills = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all blockchain requests from the database
    const blockchainRequests = await prisma.blockchainRequest.findMany({
      include: {
        bill: true
      }
    });

    res.status(200).json({ blockchainRequests });
  } catch (error) {
    console.error('Error getting blockchain bills:', error);
    res.status(500).json({ error: 'Failed to get blockchain bills' });
  }
};

/**
 * Get blockchain bills for a specific user
 */
export const getUserBlockchainBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get user's bills that have blockchain requests
    const bills = await prisma.bill.findMany({
      where: {
        userId,
        category: 'BLOCKCHAIN',
        blockchainRequest: {
          isNot: null
        }
      },
      include: {
        blockchainRequest: true
      }
    });

    res.status(200).json({ bills });
  } catch (error) {
    console.error('Error getting user blockchain bills:', error);
    res.status(500).json({ error: 'Failed to get user blockchain bills' });
  }
};

/**
 * Sync all wallet balances with blockchain data
 */
export const syncWalletBalances = async (req: Request, res: Response): Promise<void> => {
  try {
    await blockchainService.syncWalletBalances();
    
    res.status(200).json({
      success: true,
      message: 'All wallet balances synchronized with blockchain data'
    });
  } catch (error) {
    console.error('Error syncing wallet balances:', error);
    res.status(500).json({ error: 'Failed to sync wallet balances' });
  }
};

/**
 * Get all sponsors (users with wallets)
 */
export const getSponsors = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all users that have a crypto wallet and are BENEFACTORS
    const sponsors = await prisma.user.findMany({
      where: {
        cryptoWallet: {
          isNot: null
        },
        role: 'BENEFACTOR'
      },
      include: {
        cryptoWallet: {
          select: {
            address: true,
            u2kBalance: true
          }
        }
      }
    });

    res.status(200).json({ sponsors });
  } catch (error) {
    console.error('Error getting sponsors:', error);
    res.status(500).json({ error: 'Failed to get sponsors' });
  }
}; 