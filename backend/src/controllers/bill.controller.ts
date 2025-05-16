// src/controllers/bill.controller.ts
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Provider } from "@prisma/client"; // Import Provider type
import { CreateBillDto } from '../dto/Bill/bill.dto'

export const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized user" });
      return;
    }

    const dto: CreateBillDto = req.body;
    let requestId: string | undefined = undefined;

    // Optional: Validate and authorize requestId if provided
    if (dto.requestId) {
      const request = await prisma.request.findUnique({
        where: { id: dto.requestId },
      });

      if (!request) {
        res.status(404).json({ message: 'Request (bundle) not found' });
        return;
      }

      if (request.requesterId !== userId) {
        res.status(403).json({ message: 'You do not own this request' });
        return;
      }

      requestId = dto.requestId;
      console.log("Incoming requestId:", requestId);
    }

    // Create the bill, with or without a requestId
    const bill = await prisma.bill.create({
      data: {
        billName: dto.billName,
        type: dto.type,
        note: dto.note,
        amount: dto.amount,
        priority: dto.priority || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        userId: userId,
        providerId: dto.providerId,
        requestId: requestId,
      },
    });

    res.status(201).json({ message: "Bill created successfully", bill });
  } catch (error) {
    console.error("Create Bill Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// GET /bills — get all bills for logged-in user
export const getAllBills = async (req: Request, res: Response): Promise<void> => {
  try {
  const userId = req.user?.id;
  if (!userId) {
  res.status(401).json({ error: "Unauthorized" });
  return;
  }
  const bills = await prisma.bill.findMany({  
    where: { userId },  
    include: { provider: true },  
    orderBy: { createdAt: "desc" },  
  });
  
  res.status(200).json({ bills });  
  } catch (error) {
  console.error("Error fetching bills:", error);
  res.status(500).json({ error: "Internal server error" });
  }
  };
  
  // GET /bills/:id — get a specific bill by ID
  export const getBillById = async (req: Request, res: Response): Promise<void> => {
  try {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {  
    res.status(401).json({ error: "Unauthorized" });  
    return;  
  }
  
  const bill = await prisma.bill.findUnique({  
    where: { id },  
    include: { provider: true },  
  });
  
  if (!bill || bill.userId !== userId) {  
    res.status(404).json({ error: "Bill not found" });  
    return;  
  }
  
  res.status(200).json({ bill });  
  } catch (error) {
  console.error("Error fetching bill:", error);
  res.status(500).json({ error: "Internal server error" });
  }
  };

  // Update an existing bill
export const updateBill = async (req: Request, res: Response): Promise<void> => {
  try {
  const userId = req.user?.id;
  const { id } = req.params;
  const { billName, type, amount, note, dueDate, priority, providerId } = req.body;
  
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  
  const existingBill = await prisma.bill.findUnique({ where: { id } });
  if (!existingBill || existingBill.userId !== userId) {
    res.status(404).json({ error: "Bill not found or unauthorized" });
    return;
  }
  
  // Optional: Validate new provider ID if changed
  let provider: Provider | null = null; // 
  if (providerId) {
    provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      res.status(404).json({ error: "Invalid provider ID" });
      return;
    }
  }
  
  const updatedBill = await prisma.bill.update({
    where: { id },
    data: {
      billName,
      type,
      amount: amount ? parseFloat(amount) : undefined,
      note,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      providerId: provider?.id,
    },
  });
  
  res.status(200).json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
  console.error("Error updating bill:", error);
  res.status(500).json({ error: "Internal server error" });
  }
  };
  
  // Delete an existing bill
  export const deleteBill = async (req: Request, res: Response): Promise<void> => {
  try {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  
  const bill = await prisma.bill.findUnique({ where: { id } });
  
  if (!bill || bill.userId !== userId) {
    res.status(404).json({ error: "Bill not found or unauthorized" });
    return;
  }
  
  await prisma.bill.delete({ where: { id } });
  
  res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
  console.error("Error deleting bill:", error);
  res.status(500).json({ error: "Internal server error" });
  }
  };


  export const sponsorBill = async (req: Request, res: Response) => {
    try {
    const userId = req.user?.id;
    const { billId } = req.params;
    const { amount } = req.body;
    
    
    if (!userId) {
      res.status(401).json({ error: "Unauthorized user" });
      return;
    }
    
    if (!amount || isNaN(amount)) {
      res.status(400).json({ error: "Amount is required and must be a number" });
      return;
    }
    
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { sponsors: true, transactions: true }
    });
    
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    
    const isAlreadySponsor = bill.sponsors.some(sponsor => sponsor.id === userId);
    
    if (!isAlreadySponsor) {
      await prisma.bill.update({
        where: { id: billId },
        data: {
          sponsors: {
            connect: { id: userId }
          }
        }
      });
    }
    
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        status: "SUCCESS",
        billId,
        reference: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      }
    });

    // Sum all successful transactions for this bill
const allTransactions = await prisma.transaction.findMany({
  where: {
    billId,
    status: "SUCCESS"
  }
});

const totalSponsored = allTransactions.reduce((sum, txn) => sum + txn.amount, 0);

// If sponsored amount >= bill amount, mark bill as PAID
if (totalSponsored >= bill.amount) {
  await prisma.bill.update({
    where: { id: billId },
    data: { status: "PAID" }
  });
}
    
    res.status(201).json({
      message: "Sponsorship successful",
      transaction
    });
    } catch (error) {
    console.error("Sponsor bill error:", error);
    res.status(500).json({ error: "Something went wrong" });
    }
    };