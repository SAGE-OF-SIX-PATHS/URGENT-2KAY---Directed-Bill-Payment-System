// src/services/recipientService.ts
import axios from 'axios';
// src/prisma/client.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

import { Transfer } from '@prisma/client';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export interface RecipientInput {
          name: string;
          account_number: string;
          bank_code: string;
          currency: string;
}

export const createRecipients = async (recipients: RecipientInput[]): Promise<Transfer[]> => {
          const results: Transfer[] = [];

          for (const recipient of recipients) {
                    try {
                              const response = await axios.post(
                                        'https://api.paystack.co/transferrecipient',
                                        {
                                                  type: 'nuban',
                                                  name: recipient.name,
                                                  account_number: recipient.account_number,
                                                  bank_code: recipient.bank_code,
                                                  currency: recipient.currency,
                                        },
                                        {
                                                  headers: {
                                                            Authorization: `Bearer ${PAYSTACK_SECRET}`,
                                                            'Content-Type': 'application/json',
                                                  },
                                        }
                              );

                              const data = response.data.data;

                              const saved = await prisma.transfer.create({
                                        data: {
                                                  name: recipient.name,
                                                  accountNumber: recipient.account_number,
                                                  bankCode: recipient.bank_code,
                                                  bankName: 'UNKNOWN', // Update if you get from Paystack response
                                                  amount: 0,
                                                  reason: 'Initial creation',
                                                  reference: data.recipient_code,
                                                  recipientCode: data.recipient_code,
                                                  status: 'pending',
                                        },
                              });

                              results.push(saved);
                    } catch (error: any) {
                              console.error(`Failed to create recipient ${recipient.name}:`, error.response?.data || error.message);
                    }
          }

          return results;
};
