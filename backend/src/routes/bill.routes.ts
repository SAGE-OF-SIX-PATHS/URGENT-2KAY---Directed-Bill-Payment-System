// routes/bill.routes.ts
import { Router } from "express";
import {
createBill,
getAllBills,
getBillById,
updateBill,
deleteBill,
sponsorBill
} from "../controllers/bill.controller";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.post("/", isAuthenticated, createBill);
router.get("/", isAuthenticated, getAllBills);
router.get("/:id", isAuthenticated, getBillById);
router.put("/:id", isAuthenticated, updateBill); 
router.delete("/:id", isAuthenticated, deleteBill); 

router.post('/:billId/sponsor', isAuthenticated, sponsorBill);

export default router;
