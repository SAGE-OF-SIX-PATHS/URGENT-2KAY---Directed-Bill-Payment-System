import { Router } from 'express';
import paystack from '../services/paystack.service'; // Ensure correct import

const router = Router();

router.post('/webhook', async (req, res) => {
          const event = req.body;
          const hash = req.headers['x-paystack-signature'] as string;
          const secret = process.env.PAYSTACK_SECRET_KEY as string;

          // Verify the webhook signature to ensure it's coming from Paystack (optional)
          // if (verifySignature(hash, secret)) {

          if (event.event === 'charge.success') {
                    // Extract the metadata from the event
                    const customFields = event.data.metadata?.custom_fields || [];
                    const phoneField = customFields.find((f: any) => f.variable_name === 'phone_number');
                    const networkField = customFields.find((f: any) => f.variable_name === 'network');

                    // Check if both phone and network are available in the metadata
                    if (phoneField && networkField && paystack.airtime) {
                              try {
                                        // Call the airtime API to send airtime
                                        const airtimeResponse = await paystack.airtime.send({
                                                  phone: phoneField.value,
                                                  amount: event.data.amount / 100, // Convert from kobo to naira
                                                  network: networkField.value,
                                        });

                                        console.log('Airtime sent successfully:', airtimeResponse);
                              } catch (error) {
                                        console.error('Failed to send airtime:', error);
                                        res.status(500).json({ error: 'Failed to send airtime' });
                                        return;
                              }
                    }
          }

          // Return a 200 status code to acknowledge the webhook
          res.sendStatus(200);
});

export default router;
