import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      userId, 
      amount, 
      description, 
      sponsorAddress, 
      recipientAddress, 
      category,
      status = 'PENDING',
      paymentMethod = 'REGULAR'
    } = req.body;

    if (!userId || !amount || !description) {
      res.status(400).json({ error: 'Missing required fields' });
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

    // Determine the proper category based on payment method
    let billCategory = category || 'UTILITIES';
    
    // If blockchain-related addresses are provided, mark it as a blockchain payment
    if (sponsorAddress && recipientAddress) {
      if (paymentMethod === 'CRYPTO' || paymentMethod === 'BLOCKCHAIN') {
        billCategory = 'BLOCKCHAIN_PAYMENT';
        
        console.log(`Creating blockchain-related bill for user ${userId}`);
      }
    }

    // Create bill in the database
    const bill = await prisma.bill.create({
      data: {
        description,
        amount: parseFloat(amount.toString()),
        status: status as any,
        category: billCategory,
        userId,
        paymentMethod
      }
    });

    console.log(`Created bill with ID ${bill.id} with category ${billCategory}`);

    res.status(201).json(bill);
  } catch (error: any) {
    console.error('Error creating bill:', error);
    res.status(500).json({ 
      error: 'Failed to create bill',
      details: error.message || 'Unknown error' 
    });
  }
};

export const getBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      userId, 
      category, 
      paymentMethod,
      status 
    } = req.query;
    
    let where: any = {};
    if (userId) {
      where.userId = userId as string;
    }
    
    // Filter by category if provided
    if (category) {
      where.category = category as string;
    }
    
    // Filter by payment method if provided
    if (paymentMethod) {
      where.paymentMethod = paymentMethod as string;
    }
    
    // Filter by status if provided
    if (status) {
      where.status = status as string;
    }
    
    // For blockchain related bills
    if (paymentMethod === 'BLOCKCHAIN' || category === 'BLOCKCHAIN_PAYMENT') {
      console.log('Getting blockchain-related bills');
    }
    
    const bills = await prisma.bill.findMany({
      where,
      include: {
        blockchainRequest: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${bills.length} bills matching query criteria`);
    
    res.status(200).json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

export const getBillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        blockchainRequest: true,
        user: true
      }
    });
    
    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }
    
    res.status(200).json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
}; 