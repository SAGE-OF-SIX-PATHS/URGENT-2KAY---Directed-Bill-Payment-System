import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import blockchainService from '../services/blockchain.service';

const prisma = new PrismaClient();

async function testBlockchainFeatures() {
  let user, wallet, billId;
  try {
    console.log('Starting blockchain feature tests...');

    // 1. Create a test user
    user = await prisma.user.create({
      data: {
        email: `test-user-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'BENEFACTEE'
      }
    });
    console.log('Created test user:', user);

    // 2. Create a wallet for the user
    wallet = await blockchainService.createUserWallet(user.id);
    console.log('Created wallet:', wallet);

    // 3. Get wallet balance
    const balance = await blockchainService.getTokenBalance(wallet.address);
    console.log('Wallet balance:', balance);

    // 4. Create a unique billId for each test run
    billId = `test-bill-id-${Date.now()}`;

    // 5. Create a Bill record first
    const bill = await prisma.bill.create({
      data: {
        id: billId,
        billName: 'Test Bill',
        description: 'Test bill description',
        type: 'TEST',
        amount: 0.1,
        userId: user.id,
        priority: 'MEDIUM',
        status: 'PENDING'
      }
    });
    console.log('Created bill record:', bill);

    // 6. Create blockchain bill request
    const billRequest = await blockchainService.createBillRequest(
      billId,
      wallet.address, // beneficiary
      '0x6CC3eD7c089a866f822Cc7182C30A07c75647eDA', // sponsor (using token contract address for testing)
      wallet.address, // payment destination
      0.1, // amount in ETH
      'Test bill description'
    );
    console.log('Created bill request:', billRequest);

    // 7. Get bill details
    const billDetails = await blockchainService.getBillDetails(billRequest.blockchainBillId);
    console.log('Bill details:', billDetails);

    // 8. Get beneficiary bills
    const beneficiaryBills = await blockchainService.getBeneficiaryBills(wallet.address);
    console.log('Beneficiary bills:', beneficiaryBills);

    // 9. Get sponsor bills
    const sponsorBills = await blockchainService.getSponsorBills('0x6CC3eD7c089a866f822Cc7182C30A07c75647eDA');
    console.log('Sponsor bills:', sponsorBills);

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Clean up test data
    if (billId) {
      await prisma.blockchainRequest.deleteMany({ where: { billId } });
      await prisma.bill.deleteMany({ where: { id: billId } });
    }
    if (wallet) {
      await prisma.cryptoWallet.deleteMany({ where: { id: wallet.id } });
    }
    if (user) {
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  }
}

// Run the tests
testBlockchainFeatures(); 