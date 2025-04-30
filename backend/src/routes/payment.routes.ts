import { Router } from "express";
import { initializeTransaction } from "../controllers/acceptPayments";
import { purchaseAirtime } from "../controllers/airtime.controller";
import { initiateTransfer } from "../controllers/transfer.controller";

const router = Router();

router.post("/accept-payment", initializeTransaction);
router.post("/airtime", purchaseAirtime);
router.post("/transfer", initiateTransfer);

export default router;