// controllers/recipientController.ts
import { Request, Response } from 'express';
import { createRecipients } from '../services/recipientService';

export const bulkCreateRecipients = async (req: Request, res: Response): Promise<void> => {
          const recipients = req.body.recipients;

          if (!Array.isArray(recipients) || recipients.length === 0) {
                    res.status(400).json({ error: 'Recipients array is required' });
          }

          try {
                    const savedRecipients = await createRecipients(recipients);
                    res.status(200).json({ message: 'Recipients created', data: savedRecipients });
          } catch (error: any) {
                    res.status(500).json({ error: error.message || 'Internal Server Error' });
          }
};