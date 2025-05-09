// routes/bill.routes.ts
import { Router } from "express";
import {
createBill,
getAllBills,
getBillById,
updateBill,
deleteBill,
} from "../controllers/bill.controller";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.post("/", isAuthenticated, createBill);
router.get("/", isAuthenticated, getAllBills);
router.get("/:id", isAuthenticated, getBillById);
router.put("/:id", isAuthenticated, updateBill); // Update route
router.delete("/:id", isAuthenticated, deleteBill); // Delete route

export default router;
