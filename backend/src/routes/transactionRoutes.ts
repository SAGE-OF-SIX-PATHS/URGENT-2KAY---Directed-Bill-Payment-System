import express from "express";
import {
          createSubaccount,
          createSplit,
          acceptPaymentWithSplit
} from "../controllers/splitPaymentController";

const router = express.Router();

// ✅ Correct route definitions
router.post("/subaccount", createSubaccount);
router.post("/split", createSplit);
router.post("/transaction/split-payment", acceptPaymentWithSplit); // <-- this is correct

export default router;
