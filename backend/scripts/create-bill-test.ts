import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { ethers } from 'ethers';

// Initialize Prisma client
const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

// Hardhat test accounts
const USER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Account #0
const SPONSOR_PRIVATE_KEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'; // Account #1

// Generate wallet addresses from private keys
const userWallet = new ethers.Wallet(USER_PRIVATE_KEY);
const sponsorWallet = new ethers.Wallet(SPONSOR_PRIVATE_KEY);

const USER_ADDRESS = userWallet.address;
const SPONSOR_ADDRESS = sponsorWallet.address;

async function createBillTest() {
  try {
    console.log('=== Bill Creation Test ===');
    console.log('User Wallet Address:', USER_ADDRESS);
    console.log('Sponsor Wallet Address:', SPONSOR_ADDRESS);
    
    // Step 1: Find or create user with crypto wallet
    console.log('\n--- Step 1: Creating or finding user with crypto wallet ---');
    
    // First check if the crypto wallet exists
    let cryptoWallet = await prisma.cryptoWallet.findUnique({
      where: { address: USER_ADDRESS },
      include: { user: true }
    });
    
    let user;
    
    if (cryptoWallet) {
      user = cryptoWallet.user;
      console.log('Found existing user with crypto wallet:', user.id);
    } else {
      // Create a new user and associate with the wallet
      console.log('No user found with wallet address. Creating new user and wallet...');
      
      user = await prisma.user.create({
        data: {
          email: `user-${USER_ADDRESS.slice(0, 8)}@example.com`,
          name: 'Test User',
          role: 'BENEFACTEE',
          cryptoWallet: {
            create: {
              address: USER_ADDRESS,
              u2kBalance: 0
            }
          }
        }
      });
      
      console.log('User created with crypto wallet:', user.id);
    }
    
    // Step 2: Create a bill
    console.log('\n--- Step 2: Creating a bill ---');
    const billData = {
      userId: user.id,
      amount: 0.001, // ETH amount
      description: 'Test Bill Payment',
      sponsorAddress: SPONSOR_ADDRESS, 
      recipientAddress: USER_ADDRESS,
      status: 'PENDING'
    };
    
    console.log('Creating bill with data:', billData);
    const createBillResponse = await axios.post(`${API_URL}/bills`, billData);
    const bill = createBillResponse.data;
    console.log('Bill created:', bill);
    
    // Step 3: Create blockchain request
    console.log('\n--- Step 3: Creating blockchain request ---');
    const blockchainRequestData = {
      billId: bill.id,
      userPrivateKey: USER_PRIVATE_KEY
    };
    
    console.log('Creating blockchain request...');
    console.log('POST', `${API_URL}/blockchain/create-request`);
    console.log('Request Body:', {
      billId: blockchainRequestData.billId,
      userPrivateKey: '0x...private key hidden...'
    });
    
    const blockchainResponse = await axios.post(
      `${API_URL}/blockchain/create-request`,
      blockchainRequestData
    );
    const blockchainRequest = blockchainResponse.data;
    console.log('Blockchain request created:', blockchainRequest);
    
    // Step 4: Print information for payment
    console.log('\n=== BILL PAYMENT INFORMATION ===');
    console.log('Bill ID:', bill.id);
    console.log('Blockchain Request ID:', blockchainRequest.id);
    console.log('\nTo pay this bill with Postman:');
    console.log(`POST ${API_URL}/blockchain/blockchain-requests/${blockchainRequest.id}/pay`);
    console.log('Request Body:');
    console.log(JSON.stringify({
      sponsorPrivateKey: SPONSOR_PRIVATE_KEY
    }, null, 2));
    
    console.log('\nTo reject/cancel this bill with Postman:');
    console.log(`POST ${API_URL}/blockchain/blockchain-requests/${blockchainRequest.id}/reject`);
    console.log('Request Body:');
    console.log(JSON.stringify({
      sponsorPrivateKey: SPONSOR_PRIVATE_KEY
    }, null, 2));
    
  } catch (error: any) {
    console.error('Error during bill creation test:', error.response?.data || error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

createBillTest(); 