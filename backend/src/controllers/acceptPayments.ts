import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import axios from "axios";
import { PAYSTACK_SECRET_KEY } from "../config/paystack";

const prisma = new PrismaClient();

export const initializeTransaction = async (
          req: Request,
          res: Response
): Promise<any> => {
          const { email, amount } = req.body;

          // Validate input
          if (!email || !amount) {
                    return res.status(400).json({ error: "Email and amount are required" });
          }

          const amountInKobo = Number(amount) * 100;

          try {
                    const response = await axios.post(
                              "https://api.paystack.co/transaction/initialize",
                              {
                                        email,
                                        amount: amountInKobo.toString()
                              },
                              {
                                        headers: {
                                                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                                                  "Content-Type": "application/json"
                                        }
                              }
                    );

                    const {
                              authorization_url,
                              access_code,
                              reference,
                              status
                    } = response.data.data;

                    // Store the transaction details in your database
                    await prisma.payment.create({
                              data: {
                                        email,
                                        amount,
                                        reference,
                                        status: "pending"
                              }
                    });

                    return res.json({ authorization_url, access_code, reference });
          } catch (error: any) {
                    console.error("Paystack error:", error.response?.data || error.message);
                    return res.status(500).json({ error: "Could not initialize payment" });
          }
};
