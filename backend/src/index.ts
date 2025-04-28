import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import paystackInit from 'paystack';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Initialize Paystack
const paystack = paystackInit(PAYSTACK_SECRET_KEY);

// Create transfer recipient
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
                                        headers: {
                                                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                                                  'Content-Type': 'application/json'
                                        }
                              }
                    );
                    res.json(response.data);
          } catch (error: any) {
                    res.status(500).json({
                              error: error.response?.data?.message || error.message
                    });
          }
});

// Initiate transfer
app.post('/api/initiate-transfer', async (req: Request, res: Response) => {
          try {
                    const response = await axios.post(
                              'https://api.paystack.co/transfer',
                              {
                                        source: 'balance',
                                        amount: req.body.amount * 100, // Convert to kobo
                                        recipient: req.body.recipient_code,
                                        reason: req.body.reason
                              },
                              {
                                        headers: {
                                                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                                                  'Content-Type': 'application/json'
                                        }
                              }
                    );
                    res.json(response.data);
          } catch (error: any) {
                    res.status(500).json({
                              error: error.response?.data?.message || error.message
                    });
          }
});

// Check transfer status
app.get('/api/transfer/:reference', async (req: Request, res: Response) => {
          try {
                    const response = await axios.get(
                              `https://api.paystack.co/transfer/${req.params.reference}`,
                              {
                                        headers: {
                                                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                                        }
                              }
                    );
                    res.json(response.data);
          } catch (error: any) {
                    res.status(500).json({
                              error: error.response?.data?.message || error.message
                    });
          }
});

// Airtime feature (unchanged)
app.post('/api/airtime', async (req: Request, res: Response): Promise<void> => {
          try {
                    const { phone, amount, network } = req.body;

                    if (!phone || !amount || !network) {
                              res.status(400).json({ error: 'Missing required fields' });
                              return;
                    }

                    const amountInKobo = amount * 100;
                    const reference = `airtime_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                    const charge = await paystack.transaction.initialize({
                              email: 'airtime@customer.com',
                              amount: amountInKobo,
                              reference,
                              name: 'Airtime Purchase',
                              metadata: {
                                        custom_fields: [
                                                  {
                                                            display_name: 'Phone Number',
                                                            variable_name: 'phone_number',
                                                            value: phone
                                                  },
                                                  {
                                                            display_name: 'Network',
                                                            variable_name: 'network',
                                                            value: network
                                                  }
                                        ]
                              }
                    });

                    res.json({ authorizationUrl: charge.data.authorization_url });
          } catch (error) {
                    console.error('Error:', error);
                    res.status(500).json({ error: 'Failed to initialize transaction' });
          }
});

// Webhook for successful payments (unchanged)
app.post('/api/webhook', async (req: Request, res: Response): Promise<void> => {
          const event = req.body;
          const hash = req.headers['x-paystack-signature'] as string;
          const secret = process.env.PAYSTACK_SECRET_KEY as string;

          if (event.event === 'charge.success') {
                    const customFields = event.data.metadata?.custom_fields || [];
                    const phoneField = customFields.find((f: any) => f.variable_name === 'phone_number');
                    const networkField = customFields.find((f: any) => f.variable_name === 'network');

                    if (phoneField && networkField && (paystack as any).airtime) {
                              try {
                                        const airtimeResponse = await (paystack as any).airtime.send({
                                                  phone: phoneField.value,
                                                  amount: event.data.amount / 100,
                                                  network: networkField.value
                                        });

                                        console.log('Airtime sent:', airtimeResponse);
                              } catch (error) {
                                        console.error('Failed to send airtime:', error);
                              }
                    }
          }

          res.sendStatus(200);
});

// Account verification endpoint (unchanged)
app.post('/api/verify-account', async (req: Request, res: Response): Promise<void> => {
          try {
                    const { account_number, bank_code } = req.body;

                    if (!account_number || !bank_code) {
                              res.status(400).json({ error: 'Account number and bank code are required' });
                              return;
                    }

                    if (!/^\d+$/.test(account_number) || account_number.length < 10) {
                              res.status(400).json({ error: 'Invalid account number format. Must be at least 10 digits' });
                              return;
                    }

                    try {
                              const response = await (paystack as any).misc.resolveAccount({
                                        account_number,
                                        bank_code
                              });

                              if (!response.data || !response.data.account_name) {
                                        throw new Error('Invalid response from Paystack');
                              }

                              res.json({
                                        account_name: response.data.account_name
                              });
                    } catch (error: any) {
                              console.error('Paystack API Error:', error);
                              if (error.response && error.response.data) {
                                        res.status(400).json({
                                                  error: error.response.data.message || 'Failed to verify account details with Paystack'
                                        });
                              } else {
                                        res.status(400).json({ error: 'Failed to verify account details. Please check the details and try again.' });
                              }
                    }
          } catch (error) {
                    console.error('Error verifying account:', error);
                    res.status(400).json({ error: 'Account verification failed' });
          }
});

// (Optional) Catch-all for unknown API routes to always return JSON
app.use('/api', (req, res) => {
          res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
});
