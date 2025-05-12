import express from "express";
import { BillController } from "../controllers/bill.controller";

const router = express.Router();

import { BillService } from "../service/billService";
import { PrismaService } from "../service/prisma.service";

const prismaService = new PrismaService();
const billService = new BillService(prismaService);
const billController = new BillController(billService, prismaService);

router.post("/:id/pay", (req, res, next) => {
  const { id } = req.params;
  billController.payBill(id, req as any).catch(next);
});
router.post("/:id/verify-payment", (req, res, next) => {
  const { id } = req.params;
  billController.verifyPayment(id)
    .then((result) => res.json(result))
    .catch(next);
});

export default router;