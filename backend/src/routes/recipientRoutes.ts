import express from 'express';
import { bulkCreateRecipients } from '../controllers/recipientController';

const router = express.Router();

router.post('/recipients/bulk', bulkCreateRecipients);

export default router;