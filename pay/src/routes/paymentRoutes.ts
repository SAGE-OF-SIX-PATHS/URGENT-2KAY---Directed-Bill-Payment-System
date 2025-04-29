// src/routes/paymentRoutes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import Paystack from 'paystack';
import { sendEmail } from '../email';

const router = express.Router();
const prisma = new PrismaClient();

if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined in the environment variables.");
  }
  
  const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
  


// Route to create a payment
router.post('/create-payment', async (req, res) => {
  const { amount, email } = req.body;

  const paymentData = {
    amount: amount * 100, // Convert to kobo
    email,
  };

  try {
    const response = await paystack.transaction.initialize(paymentData);
    res.json({ message: 'Payment initialized', data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing payment', error });
  }
});

// Paystack webhook for payment success
router.post('/paystack-webhook', (req, res) => {
  const { event, data } = req.body;

  if (event === 'charge.success') {
    const { reference, email } = data;

    sendEmail(
        data.email,
        'Payment Successful',
        `Your payment with reference ${data.reference} was successful.`
      );  

    // Update payment status in DB
    // Create a transaction activity
    prisma.transactionActivity.create({
      data: {
        transactionId: reference,
        userId: 1, // Replace with actual userId from context
        action: 'payment_success',
        description: `Payment successful for ${email}`,
      },
    });
  }

  res.sendStatus(200);
});

export default router;
