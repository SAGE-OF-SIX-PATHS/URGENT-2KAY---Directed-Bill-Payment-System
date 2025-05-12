import express, { Router } from 'express';
import * as blockchainController from '../controllers/blockchain.controller';

const router: Router = express.Router();

// Wallet-related routes
router.post('/wallets/:userId', blockchainController.createWallet);
router.get('/wallets/:userId/balance', blockchainController.getWalletBalance);
router.post('/wallets/:userId/connect', blockchainController.connectExistingWallet);

// Bill request routes
router.post('/bills/:billId/request', blockchainController.createBillRequest);
router.post('/blockchain-requests/:blockchainRequestId/pay-native', blockchainController.payBillWithNative);
router.post('/blockchain-requests/:blockchainRequestId/pay-u2k', blockchainController.payBillWithU2K);
router.post('/blockchain-requests/:blockchainRequestId/reject', blockchainController.rejectBill);

// Blockchain info routes
router.get('/blockchain-bills/:blockchainBillId', blockchainController.getBillDetails);
router.get('/beneficiary-bills/:address', blockchainController.getBeneficiaryBills);
router.get('/sponsor-bills/:address', blockchainController.getSponsorBills);

export default router; 