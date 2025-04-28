import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Allow frontend origin
app.use(express.json());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

app.post('/api/create-recipient', async (req: Request, res: Response) => {
          try {
                    const response = await axios.post(
                              'https://api.paystack.co/transferrecipient',
                              {
                                        type: 'nuban',
                                        name: req.body.recipient_name,
                                        account_number: req.body.account_number,
                                        bank_code: req.body.bank_code,
                                        currency: req.body.currency || 'NGN'
                              },
                              {
                                        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
                              }
                    );
                    res.json(response.data);
          } catch (error: any) {
                    res.status(400).json({ error: error.response?.data?.message || error.message });
          }
});

app.post('/api/initiate-transfer', async (req: Request, res: Response) => {
          try {
                    const response = await axios.post(
                              'https://api.paystack.co/transfer',
                              {
                                        source: 'balance',
                                        amount: req.body.amount * 100,
                                        recipient: req.body.recipient_code,
                                        reason: req.body.reason
                              },
                              {
                                        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
                              }
                    );
                    res.json(response.data);
          } catch (error: any) {
                    res.status(400).json({ error: error.response?.data?.message || error.message });
          }
});

app.get('/api/transfer/:reference', async (req: Request, res: Response) => {
          try {
                    const response = await axios.get(
                              `https://api.paystack.co/transfer/${req.params.reference}`,
                              {
                                        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
                              }
                    );
                    res.json(response.data);
          } catch (error: any) {
                    res.status(400).json({ error: error.response?.data?.message || error.message });
          }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
