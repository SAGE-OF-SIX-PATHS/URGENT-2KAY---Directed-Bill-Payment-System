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

async function registerSponsor() {
  try {
    console.log('=== Sponsor Registration with Crypto Wallet ===');
    
    // Check for wallet files
    const walletDir = path.join(__dirname, 'wallets');
    if (!fs.existsSync(walletDir)) {
      console.error('Wallet directory not found! Please run 1-create-wallet.ts first.');
      return;
    }
    
    // List all sponsor wallet files
    const files = fs.readdirSync(walletDir).filter(f => f.startsWith('sponsor-'));
    
    if (files.length === 0) {
      console.error('No sponsor wallet files found! Please run 1-create-wallet.ts first.');
      return;
    }
    
    console.log('\nAvailable sponsor wallets:');
    files.forEach((file, index) => {
      const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, file), 'utf8'));
      console.log(`${index + 1}. ${walletData.address} (${file})`);
    });
    
    // Ask user to select a wallet
    const walletIndex = parseInt(await question('\nSelect a sponsor wallet by number: ')) - 1;
    
    if (walletIndex < 0 || walletIndex >= files.length) {
      console.error('Invalid selection!');
      return;
    }
    
    // Load the selected wallet
    const walletFile = files[walletIndex];
    const walletData = JSON.parse(fs.readFileSync(path.join(walletDir, walletFile), 'utf8'));
    console.log(`\nSelected sponsor wallet: ${walletData.address}`);
    
    // Get sponsor details
    const name = await question('Enter sponsor name: ');
    const email = await question('Enter sponsor email: ');
    
    // Check if the crypto wallet already exists
    const existingWallet = await prisma.cryptoWallet.findUnique({
      where: { address: walletData.address },
      include: { user: true }
    });
    
    if (existingWallet) {
      console.log('\nThis wallet is already registered!');
      console.log('Sponsor details:');
      console.log(`ID: ${existingWallet.user.id}`);
      console.log(`Name: ${existingWallet.user.name}`);
      console.log(`Email: ${existingWallet.user.email}`);
      console.log(`Role: ${existingWallet.user.role}`);
      return;
    }
    
    // Create a new sponsor with the crypto wallet
    const sponsor = await prisma.user.create({
      data: {
        name,
        email,
        role: 'BENEFACTOR', // Sponsor has BENEFACTOR role
        cryptoWallet: {
          create: {
            address: walletData.address,
            u2kBalance: 0
          }
        }
      }
    });
    
    console.log('\n✅ Sponsor registered successfully!');
    console.log('Sponsor ID:', sponsor.id);
    console.log('Wallet Address:', walletData.address);
    
    // Save sponsor ID to the wallet file for future reference
    walletData.sponsorId = sponsor.id;
    fs.writeFileSync(path.join(walletDir, walletFile), JSON.stringify(walletData, null, 2));
    
    console.log('\nWallet file updated with sponsor ID reference.');
    console.log('You can now use this sponsor to pay bills.');
    
    return sponsor;
  } catch (error: any) {
    console.error('Error registering sponsor:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

registerSponsor(); 