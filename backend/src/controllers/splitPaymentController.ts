// src/controllers/splitPaymentController.ts

import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { PAYSTACK_SECRET_KEY } from "../config/paystack";

// Create Axios instance for Paystack
const paystackAPI = axios.create({
          baseURL: "https://api.paystack.co",
          headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
          },
});

// Step 1: Create subaccounts (you can do this in advance and store their codes in DB)
export const createSubaccount = async (req: Request, res: Response, next: NextFunction) => {
          const { business_name, bank_code, account_number, percentage_charge } = req.body;

          try {
                    const response = await paystackAPI.post("/subaccount", {
                              business_name,
                              bank_code,
                              account_number,
                              percentage_charge,
                    });

                    res.status(201).json(response.data);
          } catch (error: any) {
                    console.error("Subaccount Error:", error.response?.data || error.message);
                    res.status(500).json({ error: "Failed to create subaccount" });
                    next(error); // Pass errors to the Express error handler
          }
};

// Step 2: Create split group
export const createSplit = async (req: Request, res: Response) => {
          const { name, type, currency, subaccounts } = req.body;

          try {
                    const response = await paystackAPI.post("/split", {
                              name,
                              type, // e.g. "percentage"
                              currency,
                              subaccounts, // Array of { subaccount, share }
                              bearer_type: "account",
                              bearer_subaccount: subaccounts[0].subaccount, // the primary
                    });

                    res.status(201).json(response.data);
          } catch (error: any) {
                    console.error("Split Creation Error:", error.response?.data || error.message);
                    res.status(500).json({ error: "Failed to create split" });
          }
};

// Step 3: Accept payment using split code
export const acceptPaymentWithSplit = async (req: Request, res: Response): Promise<void> => {
          const { email, amount, split_code } = req.body;

          if (!email || !amount || !split_code) {
                     res.status(400).json({ error: "Missing required fields" });
          }

          try {
                    const response = await paystackAPI.post("/transaction/initialize", {
                              email,
                              amount: amount * 100,
                              split_code,
                    });

                    const { authorization_url, reference } = response.data.data;
                    res.json({ authorization_url, reference });
          } catch (error: any) {
                    console.error("Payment Init Error:", error.response?.data || error.message);
                    res.status(500).json({ error: "Failed to initialize split payment" });
          }
};
