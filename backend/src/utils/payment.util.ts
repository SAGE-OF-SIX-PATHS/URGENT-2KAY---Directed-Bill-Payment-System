import axios from "axios";
import dotenv from "dotenv";
import { PAYSTACK_SECRET_KEY } from "../config/paystack";

dotenv.config();

const paystack = axios.create({
          baseURL: "https://api.paystack.co",
          headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
          },
});

export const initializeTransaction = async ({ email, amount }: { email: string; amount: number }) => {
  const amountInKobo = amount * 100;

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    { email, amount: amountInKobo },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { authorization_url, reference } = response.data.data;
  return { authorization_url, reference };
};

export default paystack;
