import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import blockchainService from '../services/blockchain.service';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

async function testFullIntegration() {
  let beneficiary, sponsor, beneficiaryWallet, sponsorWallet;
  try {
    console.log('Starting full integration test...');

    // 1. Create test users
    beneficiary = await prisma.user.create({
      data: {
        email: `beneficiary-${Date.now()}@example.com`,
        name: 'Test Beneficiary',
        role: 'BENEFACTEE'
      }
    });
    console.log('Created beneficiary:', beneficiary);

    sponsor = await prisma.user.create({
      data: {
        email: `sponsor-${Date.now()}@example.com`,
        name: 'Test Sponsor',
        role: 'BENEFACTOR'
      }
    });
    console.log('Created sponsor:', sponsor);

    // 2. Create wallets for both users
    beneficiaryWallet = await blockchainService.createUserWallet(beneficiary.id);
    console.log('Created beneficiary wallet:', beneficiaryWallet);

    sponsorWallet = await blockchainService.createUserWallet(sponsor.id);
    console.log('Created sponsor wallet:', sponsorWallet);

    // 3. Create a bill
    const billId = `test-bill-${Date.now()}`;
    const bill = await prisma.bill.create({
      data: {
        id: billId,
        billName: 'Integration Test Bill',
        description: 'Test bill for integration testing',
        type: 'TEST',
        amount: 0.1,
        userId: beneficiary.id,
        priority: 'MEDIUM',
        status: 'PENDING'
      }
    });
    console.log('Created bill:', bill);

    // 4. Create blockchain bill request
    const billRequest = await blockchainService.createBillRequest(
      billId,
      beneficiaryWallet.address,
      sponsorWallet.address,
      beneficiaryWallet.address,
      0.1,
      'Integration test bill description'
    );
    console.log('Created blockchain bill request:', billRequest);

    // 5. Get initial balances
    const initialBeneficiaryBalance = await blockchainService.getTokenBalance(beneficiaryWallet.address);
    const initialSponsorBalance = await blockchainService.getTokenBalance(sponsorWallet.address);
    console.log('Initial balances:', {
      beneficiary: initialBeneficiaryBalance,
      sponsor: initialSponsorBalance
    });

    // 6. Pay bill with native tokens (ETH)
    const paymentTx = await blockchainService.payBillWithNative(
      billRequest.blockchainBillId,
      sponsorWallet.privateKey,
      '0.1'
    );
    console.log('Bill payment transaction:', paymentTx);

    // 7. Get final balances
    const finalBeneficiaryBalance = await blockchainService.getTokenBalance(beneficiaryWallet.address);
    const finalSponsorBalance = await blockchainService.getTokenBalance(sponsorWallet.address);
    console.log('Final balances:', {
      beneficiary: finalBeneficiaryBalance,
      sponsor: finalSponsorBalance
    });

    // 8. Verify bill status
    const billDetails = await blockchainService.getBillDetails(billRequest.blockchainBillId);
    console.log('Final bill details:', billDetails);

    // 9. Get transaction history
    const beneficiaryBills = await blockchainService.getBeneficiaryBills(beneficiaryWallet.address);
    const sponsorBills = await blockchainService.getSponsorBills(sponsorWallet.address);
    console.log('Transaction history:', {
      beneficiaryBills,
      sponsorBills
    });

    console.log('Integration test completed successfully!');
  } catch (error) {
    console.error('Error during integration test:', error);
  } finally {
    // Clean up test data
    if (beneficiary) {
      await prisma.user.delete({ where: { id: beneficiary.id } });
    }
    if (sponsor) {
      await prisma.user.delete({ where: { id: sponsor.id } });
    }
    if (beneficiaryWallet) {
      await prisma.cryptoWallet.delete({ where: { id: beneficiaryWallet.id } });
    }
    if (sponsorWallet) {
      await prisma.cryptoWallet.delete({ where: { id: sponsorWallet.id } });
    }
    await prisma.$disconnect();
  }
}

// Run the integration test
testFullIntegration(); 