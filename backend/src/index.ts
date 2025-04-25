import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paystackInit from 'paystack';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000;

// Initialize Paystack without type assertions
const paystack = paystackInit(process.env.PAYSTACK_SECRET_KEY as string);

app.use(cors());
app.use(express.json());

// Account verification endpoint
app.post('/api/verify-account', async (req: Request, res: Response): Promise<void> => {
          try {
                    const { account_number, bank_code } = req.body;

                    if (!account_number || !bank_code) {
                              res.status(400).json({ error: 'Account number and bank code are required' });
                              return;
                    }

                    // Verify the account number is valid (numeric and correct length)
                    if (!/^\d+$/.test(account_number) || account_number.length < 10) {
                              res.status(400).json({ error: 'Invalid account number format. Must be at least 10 digits' });
                              return;
                    }

                    // Use try-catch for the Paystack API call
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
                                        // Forward Paystack's error message
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

// Transfer endpoint
app.post('/api/transfer', async (req: Request, res: Response): Promise<void> => {
          try {
                    const { email, amount, account_number, bank_code, account_name } = req.body;

                    if (!email || !amount || !account_number || !bank_code || !account_name) {
                              res.status(400).json({ error: 'Missing required fields' });
                              return;
                    }

                    const amountInKobo = amount * 100;
                    const reference = `transfer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                    const charge = await paystack.transaction.initialize({
                              email,
                              amount: amountInKobo,
                              reference,
                              name: account_name,
                              metadata: {
                                        custom_fields: [
                                                  {
                                                            display_name: 'Account Number',
                                                            variable_name: 'account_number',
                                                            value: account_number
                                                  },
                                                  {
                                                            display_name: 'Bank Code',
                                                            variable_name: 'bank_code',
                                                            value: bank_code
                                                  },
                                                  {
                                                            display_name: 'Account Name',
                                                            variable_name: 'account_name',
                                                            value: account_name
                                                  }
                                        ]
                              }
                    });

                    res.json({ authorizationUrl: charge.data.authorization_url });
          } catch (error) {
                    console.error('Transfer Error:', error);
                    res.status(500).json({ error: 'Failed to initialize transfer' });
          }
});

// Airtime purchase endpoint
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

// Webhook for successful payments
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

app.listen(port, () => {
          console.log(`Server running on http://localhost:${port}`);
});