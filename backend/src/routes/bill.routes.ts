// routes/bill.routes.ts
import { Router } from "express";
import {createBill, getAllBills, getBillById,} from "../controllers/bill.controller";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.post("/create", isAuthenticated, createBill);
router.get("/", isAuthenticated, getAllBills);
router.get("/:id", isAuthenticated, getBillById);

export default router;
