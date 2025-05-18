import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createBill() {
  try {
    console.log('=== Create a Bill ===');
    
    // Check for wallet files
    const walletDir = path.join(__dirname, 'wallets');
    if (!fs.existsSync(walletDir)) {
      console.error('Wallet directory not found! Please run previous scripts first.');
      return;
    }
    
    // Step 1: Select a user wallet (bill creator)
    console.log('\n--- Step 1: Select a user wallet (bill creator) ---');
    
    const userFiles = fs.readdirSync(walletDir).filter(f => f.startsWith('wallet-'));
    if (userFiles.length === 0) {
      console.error('No user wallets found! Please run 1-create-wallet.ts first.');
      return;
    }
    
    console.log('\nAvailable user wallets:');
    userFiles.forEach((file, index) => {
      const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, file), 'utf8'));
      console.log(`${index + 1}. ${walletData.address} (${file})`);
    });
    
    const userWalletIndex = parseInt(await question('\nSelect a user wallet by number: ')) - 1;
    
    if (userWalletIndex < 0 || userWalletIndex >= userFiles.length) {
      console.error('Invalid selection!');
      return;
    }
    
    const userWalletFile = userFiles[userWalletIndex];
    const userWalletData = JSON.parse(fs.readFileSync(path.join(walletDir, userWalletFile), 'utf8'));
    
    // Check if the user is registered
    if (!userWalletData.userId) {
      console.error('This wallet is not registered as a user. Please run 2-register-user.ts first.');
      return;
    }
    
    console.log(`\nSelected user wallet: ${userWalletData.address}`);
    console.log(`User ID: ${userWalletData.userId}`);
    
    // Step 2: Select a sponsor wallet (bill payer)
    console.log('\n--- Step 2: Select a sponsor wallet (bill payer) ---');
    
    const sponsorFiles = fs.readdirSync(walletDir).filter(f => f.startsWith('sponsor-'));
    if (sponsorFiles.length === 0) {
      console.error('No sponsor wallets found! Please run 1-create-wallet.ts first.');
      return;
    }
    
    console.log('\nAvailable sponsor wallets:');
    sponsorFiles.forEach((file, index) => {
      const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, file), 'utf8'));
      console.log(`${index + 1}. ${walletData.address} (${file})`);
    });
    
    const sponsorWalletIndex = parseInt(await question('\nSelect a sponsor wallet by number: ')) - 1;
    
    if (sponsorWalletIndex < 0 || sponsorWalletIndex >= sponsorFiles.length) {
      console.error('Invalid selection!');
      return;
    }
    
    const sponsorWalletFile = sponsorFiles[sponsorWalletIndex];
    const sponsorWalletData = JSON.parse(fs.readFileSync(path.join(walletDir, sponsorWalletFile), 'utf8'));
    
    console.log(`\nSelected sponsor wallet: ${sponsorWalletData.address}`);
    
    // Step 3: Get bill details
    console.log('\n--- Step 3: Enter bill details ---');
    
    const description = await question('Enter bill description: ');
    const amountStr = await question('Enter bill amount in ETH (e.g., 0.001): ');
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount! Please enter a positive number.');
      return;
    }
    
    // Step 4: Create the bill via API
    console.log('\n--- Step 4: Creating the bill ---');
    
    const billData = {
      userId: userWalletData.userId,
      amount,
      description,
      sponsorAddress: sponsorWalletData.address,
      recipientAddress: userWalletData.address,
      status: 'PENDING'
    };
    
    console.log('Creating bill with data:', billData);
    
    try {
      const createBillResponse = await axios.post(`${API_URL}/bills`, billData);
      const bill = createBillResponse.data;
      console.log('\n✅ Bill created successfully!');
      console.log('Bill ID:', bill.id);
      
      // Save bill information to a file for future reference
      const billsDir = path.join(walletDir, 'bills');
      if (!fs.existsSync(billsDir)) {
        fs.mkdirSync(billsDir);
      }
      
      const billFilePath = path.join(billsDir, `bill-${bill.id}.json`);
      fs.writeFileSync(billFilePath, JSON.stringify({
        ...bill,
        userWallet: {
          address: userWalletData.address,
          privateKey: userWalletData.privateKey
        },
        sponsorWallet: {
          address: sponsorWalletData.address,
          privateKey: sponsorWalletData.privateKey
        }
      }, null, 2));
      
      console.log(`\nBill details saved to: ${billFilePath}`);
      console.log('\nYou can now proceed to create a blockchain request for this bill.');
      
      return bill;
    } catch (error: any) {
      console.error('Failed to create bill:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('Error creating bill:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createBill(); 