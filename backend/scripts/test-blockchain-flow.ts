import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

// Test data
const testPrivateKey = '216d9c28ae487380edeb11bdc49d4f0bd51ac14e33e9406bee36f40684925f79'; // Replace with your test private key

async function runTest() {
  try {
    console.log('🔍 Starting blockchain payment flow test...');
    
    // Step 1: Create or get test user
    console.log('\n📋 Step 1: Creating test user...');
    const userId = 'test-user-id';
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          role: 'BENEFACTEE'
        }
      });
      console.log('✅ Created test user:', user.id);
    } else {
      console.log('✅ Using existing test user:', user.id);
    }
    
    // Step 2: Create a unique test bill
    console.log('\n📋 Step 2: Creating test bill...');
    const billId = `test-bill-id-${Date.now()}`;
    const bill = await prisma.bill.create({
      data: {
        id: billId,
        description: 'Test Bill for Blockchain Payment Flow',
        amount: 0.01,
        status: 'PENDING',
        userId: userId,
        category: 'UTILITIES'
      }
    });
    console.log('✅ Created test bill:', bill.id);
    
    // Step 3: Create or get wallet for test user
    console.log('\n📋 Step 3: Creating/getting wallet...');
    let walletResponse;
    try {
      walletResponse = await axios.post(`${API_URL}/blockchain/wallets/${userId}`);
      console.log('✅ Wallet created/retrieved:', walletResponse.data.address);
    } catch (error: any) {
      console.error('❌ Error creating wallet:', error.response?.data || error.message);
      return;
    }
    
    // Step 4: Create blockchain request
    console.log('\n📋 Step 4: Creating blockchain request...');
    let blockchainRequestResponse;
    try {
      blockchainRequestResponse = await axios.post(`${API_URL}/blockchain/bills/${billId}/request`, {
        beneficiaryAddress: walletResponse.data.address,
        sponsorAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Test address
        paymentDestination: walletResponse.data.address,
        amount: 0.01,
        description: 'Test Payment Flow'
      });
      
      console.log('✅ Blockchain request created:');
      console.log('   Transaction Hash:', blockchainRequestResponse.data.transactionHash);
      console.log('   Blockchain Request ID:', blockchainRequestResponse.data.blockchainRequestId);
      console.log('   Blockchain Bill ID:', blockchainRequestResponse.data.blockchainBillId);
    } catch (error: any) {
      console.error('❌ Error creating blockchain request:', error.response?.data || error.message);
      return;
    }
    
    // Step 5: Get bill details using blockchain bill ID
    console.log('\n📋 Step 5: Getting bill details...');
    try {
      const billDetailsResponse = await axios.get(
        `${API_URL}/blockchain/blockchain-bills/${blockchainRequestResponse.data.blockchainBillId}`
      );
      console.log('✅ Blockchain bill details:', billDetailsResponse.data);
    } catch (error: any) {
      console.error('❌ Error getting bill details:', error.response?.data || error.message);
    }
    
    // Step 6: Pay bill with native tokens
    console.log('\n📋 Step 6: Preparing request for paying bill with native tokens...');
    console.log('To pay the bill, make a POST request to:');
    console.log(`${API_URL}/blockchain/blockchain-requests/${blockchainRequestResponse.data.blockchainRequestId}/pay-native`);
    console.log('With this request body:');
    console.log(JSON.stringify({
      sponsorPrivateKey: testPrivateKey,
      amount: "0.01",
      blockchainBillId: blockchainRequestResponse.data.blockchainBillId
    }, null, 2));
    
    console.log('\n✨ Test flow completed successfully!');
    console.log('Use the information above to continue testing in Postman.');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest(); 