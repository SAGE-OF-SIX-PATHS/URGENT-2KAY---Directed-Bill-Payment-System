import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { authenticateJWT } from "../middlewares/auth";


const router = express.Router();
const prisma = new PrismaClient();

// Protect all bill routes
router.use(authenticateJWT);

// Create a new bill
router.post('/', async (req: Request, res: Response) => {
  const { title, amount, dueDate } = req.body;
  const userId = req.user.id;

  try {
    const bill = await prisma.bill.create({
      data: { userId, title, amount, dueDate: new Date(dueDate) },
    });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Error creating bill', error: err });
  }
});

// Get all bills for logged-in user
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const bills = await prisma.bill.findMany({ where: { userId } });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bills', error: err });
  }
});

// Get one bill (only if it belongs to user)
router.get('/:id', async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const bill = await prisma.bill.findUnique({ where: { id: req.params.id } });

    if (!bill || bill.userId !== userId) {
      return res.status(404).json({ message: 'Bill not found or unauthorized' });
    }

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bill', error: err });
  }
});

// Update a bill
router.put('/:id', async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { title, amount, dueDate, isPaid } = req.body;

  try {
    const existing = await prisma.bill.findUnique({ where: { id: req.params.id } });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Bill not found or unauthorized' });
    }

    const updated = await prisma.bill.update({
      where: { id: req.params.id },
      data: { title, amount, dueDate: new Date(dueDate), isPaid },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating bill', error: err });
  }
});

// Delete a bill
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const existing = await prisma.bill.findUnique({ where: { id: req.params.id } });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Bill not found or unauthorized' });
    }

    await prisma.bill.delete({ where: { id: req.params.id } });

    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting bill', error: err });
  }
});

export default router;
