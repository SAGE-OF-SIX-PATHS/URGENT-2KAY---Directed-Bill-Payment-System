import { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PAYSTACK_SECRET_KEY } from "../config/paystack";
import { getBankCodeByName } from "../utils/getBankCode";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create Paystack API instance
const paystackAPI = axios.create({
          baseURL: "https://api.paystack.co",
          headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
          },
});

// Controller function to initiate transfer
export const initiateTransfer = async (
          req: Request,
          res: Response
): Promise<any> => {
          const { name, account_number, bank_name, amount, reason } = req.body;
          console.log(req.body);

          if (!name || !account_number || !bank_name || !amount || !reason) {
                    return res.status(400).json({ error: "Missing required fields" });
          }

          try {
                    // Step 1: Get bank code
                    const bank_code = await getBankCodeByName(bank_name);
                    if (!bank_code) {
                              return res.status(400).json({ error: "Unsupported or invalid bank name" });
                    }

                    // Step 2: Create transfer recipient
                    const recipientResponse = await paystackAPI.post("/transferrecipient", {
                              type: "nuban",
                              name,
                              account_number,
                              bank_code,
                              currency: "NGN",
                    });

                    const recipient_code = recipientResponse.data.data.recipient_code;
                    console.log("Recipient Code:", recipient_code);

                    // Step 3: Initiate transfer
                    const reference = uuidv4();
                    const transferResponse = await paystackAPI.post("/transfer", {
                              source: "balance",
                              amount: amount * 100, // convert to kobo
                              recipient: recipient_code,
                              reason,
                              reference,
                    });

                    const transferData = transferResponse.data.data;

                    // ✅ Step 4: Persist transfer in DB
                    await prisma.transfer.create({
                              data: {
                                        name,
                                        accountNumber: account_number,
                                        bankName: bank_name,
                                        bankCode: bank_code,
                                        recipientCode: recipient_code,
                                        amount,
                                        reason,
                                        reference,
                                        status: transferData.status || "pending", // fallback if Paystack doesn't return a status
                              },
                    });

                    res.json({ transfer: transferData });
          } catch (error: any) {
                    console.error("Transfer Error:", error.response?.data || error.message);
                    res.status(500).json({ error: "Transfer failed" });
          }
};
