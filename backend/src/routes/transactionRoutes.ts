import express, { Request, Response } from "express";
import {
          createSubaccount,
          createSplit,
          acceptPaymentWithSplit
} from "../controllers/splitPaymentController";
import { BillController } from "../controllers/bill.controller";

const router = express.Router();
import { BillService } from "../service/billService";
import { PrismaService } from "../service/prisma.service";

const prismaService = new PrismaService();
const billService = new BillService(prismaService);
const billController = new BillController(billService, prismaService);

// ✅ Correct route definitions
router.post("/subaccount", createSubaccount);
router.post("/split", createSplit);
router.post("/transaction/split-payment", acceptPaymentWithSplit); // <-- this is correct

router.get("/requests", async (req: express.Request, res: express.Response) => {
  try {
    const result = await billController.getRequests(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: (error as Error).message });
  }
});
router.post("/:id/pay", billController.payBill.bind(billController));
router.post("/:id/verify-payment", billController.verifyPayment.bind(billController));

export default router;
