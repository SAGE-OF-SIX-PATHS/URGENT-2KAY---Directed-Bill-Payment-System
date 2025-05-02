import express from 'express';
import emailService from '../services/email.service';
import { EmailPayload } from '../models/emailModel';

export const emailRouter = express.Router();

emailRouter.post('/send-email', async (req, res, next) => {
          try {
                    const { email, subject, message } = req.body;
                    await emailService(email, subject, message);
                    res.status(200).json({ success: true, message: 'Email sent successfully' });
          } catch (error) {
                    // Added error logging and proper error propagation
                    console.error('Email send error:', error);
                    next(new Error('EMAIL_SEND_FAILED'));
          }
});
