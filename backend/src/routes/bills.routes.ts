import express, { Router } from 'express';
import * as billsController from '../controllers/bills.controller';

const router: Router = express.Router();

// Bill routes
router.post('/', billsController.createBill);
router.get('/', billsController.getBills);
router.get('/:id', billsController.getBillById);

export default router; 