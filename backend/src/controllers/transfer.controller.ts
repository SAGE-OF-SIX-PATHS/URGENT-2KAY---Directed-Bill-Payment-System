import { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PAYSTACK_SECRET_KEY } from "../config/paystack";
import { getBankCodeByName } from "../utils/getBankCode";

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
                    // Create Transfer Recipient
                    const bank_code = await getBankCodeByName(bank_name);
                    if (!bank_code) {
                              return res.status(400).json({ error: "Unsupported or invalid bank name" })
                    }
                    const recipientResponse = await paystackAPI.post("/transferrecipient", {
                              type: "nuban",
                              name,
                              account_number,
                              bank_code,
                              currency: "NGN",
                    });

                    const recipient_code = recipientResponse.data.data.recipient_code;
                    console.log(recipient_code);

                    //Initiate Transfer
                    const transferResponse = await paystackAPI.post("/transfer", {
                              source: "balance",
                              amount: amount * 100, // convert to kobo
                              recipient: recipient_code,
                              reason,
                              reference: uuidv4(),
                    });

                    res.json({ transfer: transferResponse.data.data });
          } catch (error: any) {
                    console.error("Transfer Error:", error.response?.data || error.message);
                    res.status(500).json({ error: "Transfer failed" });
          }
};
