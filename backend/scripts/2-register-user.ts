import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

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

async function registerUser() {
  try {
    console.log('=== User Registration with Crypto Wallet ===');
    
    // Check for wallet files
    const walletDir = path.join(__dirname, 'wallets');
    if (!fs.existsSync(walletDir)) {
      console.error('Wallet directory not found! Please run 1-create-wallet.ts first.');
      return;
    }
    
    // List all wallet files
    const files = fs.readdirSync(walletDir).filter(f => f.startsWith('wallet-'));
    
    if (files.length === 0) {
      console.error('No wallet files found! Please run 1-create-wallet.ts first.');
      return;
    }
    
    console.log('\nAvailable wallets:');
    files.forEach((file, index) => {
      const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, file), 'utf8'));
      console.log(`${index + 1}. ${walletData.address} (${file})`);
    });
    
    // Ask user to select a wallet
    const walletIndex = parseInt(await question('\nSelect a wallet by number: ')) - 1;
    
    if (walletIndex < 0 || walletIndex >= files.length) {
      console.error('Invalid selection!');
      return;
    }
    
    // Load the selected wallet
    const walletFile = files[walletIndex];
    const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, walletFile), 'utf8'));
    console.log(`\nSelected wallet: ${walletData.address}`);
    
    // Get user details
    const name = await question('Enter your name: ');
    const email = await question('Enter your email: ');
    
    // Check if the crypto wallet already exists
    const existingWallet = await prisma.cryptoWallet.findUnique({
      where: { address: walletData.address },
      include: { user: true }
    });
    
    if (existingWallet) {
      console.log('\nThis wallet is already registered!');
      console.log('User details:');
      console.log(`ID: ${existingWallet.user.id}`);
      console.log(`Name: ${existingWallet.user.name}`);
      console.log(`Email: ${existingWallet.user.email}`);
      console.log(`Role: ${existingWallet.user.role}`);
      return;
    }
    
    // Create a new user with the crypto wallet
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'BENEFACTEE',
        cryptoWallet: {
          create: {
            address: walletData.address,
            u2kBalance: 0
          }
        }
      }
    });
    
    console.log('\n✅ User registered successfully!');
    console.log('User ID:', user.id);
    console.log('Wallet Address:', walletData.address);
    
    // Save user ID to the wallet file for future reference
    walletData.userId = user.id;
    fs.writeFileSync(path.join(walletDir, walletFile), JSON.stringify(walletData, null, 2));
    
    console.log('\nWallet file updated with user ID reference.');
    console.log('You can now proceed to create a bill using this wallet.');
    
    return user;
  } catch (error: any) {
    console.error('Error registering user:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

registerUser(); 