// src/controllers/bill.controller.ts
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Provider } from "@prisma/client"; // Import Provider type

export const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // `req.user` is set by auth middleware

    if (!userId) {
      res.status(401).json({ error: "Unauthorized user" });
      return;
    }

    const { billName, type, amount, note, dueDate, priority, providerId } = req.body;

    // Manual input validation
    if (!billName || !type || !amount) {
      res.status(400).json({
        error: "billName, type, and amount are required",
      });
      return;
    }

    // Optional: Validate provider exists
    let provider: Provider | null = null;
    if (providerId) {
      provider = await prisma.provider.findUnique({ where: { id: providerId } });
      if (!provider) {
        res.status(404).json({ error: "Invalid provider ID" });
        return;
      }
    }

    const bill = await prisma.bill.create({
      data: {
        billName,
        type,
        amount: parseFloat(amount),
        note,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority: priority || "MEDIUM",
        userId,
        providerId: provider?.id,
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