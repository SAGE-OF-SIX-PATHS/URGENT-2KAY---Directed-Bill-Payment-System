import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

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

async function submitBillToBlockchain() {
  try {
    console.log('=== Submit Bill to Blockchain ===');
    
    // Check for bill files
    const walletDir = path.join(__dirname, 'wallets');
    const billsDir = path.join(walletDir, 'bills');
    
    if (!fs.existsSync(billsDir)) {
      console.error('No bills directory found! Please create a bill first using 4-create-bill.ts.');
      return;
    }
    
    const billFiles = fs.readdirSync(billsDir).filter(f => f.startsWith('bill-'));
    
    if (billFiles.length === 0) {
      console.error('No bill files found! Please create a bill first using 4-create-bill.ts.');
      return;
    }
    
    // List all bills
    console.log('\nAvailable bills:');
    billFiles.forEach((file, index) => {
      const billData = JSON.parse(fs.readFileSync(path.join(billsDir, file), 'utf8'));
      console.log(`${index + 1}. ${billData.description} - ${billData.amount} ETH (${file})`);
    });
    
    // Ask user to select a bill
    const billIndex = parseInt(await question('\nSelect a bill by number: ')) - 1;
    
    if (billIndex < 0 || billIndex >= billFiles.length) {
      console.error('Invalid selection!');
      return;
    }
    
    // Load the selected bill
    const billFile = billFiles[billIndex];
    const billData = JSON.parse(fs.readFileSync(path.join(billsDir, billFile), 'utf8'));
    
    console.log('\nSelected bill:');
    console.log(`ID: ${billData.id}`);
    console.log(`Description: ${billData.description}`);
    console.log(`Amount: ${billData.amount} ETH`);
    console.log(`Recipient: ${billData.userWallet.address}`);
    console.log(`Sponsor: ${billData.sponsorWallet.address}`);
    
    // Submit bill to blockchain
    console.log('\nSubmitting bill to blockchain...');
    
    const blockchainRequestData = {
      billId: billData.id,
      userPrivateKey: billData.userWallet.privateKey
    };
    
    try {
      console.log('POST', `${API_URL}/blockchain/create-request`);
      console.log('Request Body:', {
        billId: blockchainRequestData.billId,
        userPrivateKey: '0x...private key hidden...'
      });
      
      const response = await axios.post(
        `${API_URL}/blockchain/create-request`,
        blockchainRequestData
      );
      
      const blockchainRequest = response.data;
      console.log('\n✅ Blockchain request created successfully!');
      console.log('Blockchain Request ID:', blockchainRequest.id);
      console.log('Status:', blockchainRequest.status);
      
      // Update the bill file with blockchain request information
      billData.blockchainRequest = blockchainRequest;
      fs.writeFileSync(path.join(billsDir, billFile), JSON.stringify(billData, null, 2));
      
      // Save blockchain request details separately for easy access
      fs.writeFileSync(
        path.join(billsDir, `blockchain-request-${blockchainRequest.id}.json`),
        JSON.stringify({
          ...blockchainRequest,
          bill: billData,
          userWallet: billData.userWallet,
          sponsorWallet: billData.sponsorWallet
        }, null, 2)
      );
      
      console.log('\n=== PAYMENT INSTRUCTIONS ===');
      console.log('\nTo pay this bill using Postman:');
      console.log(`POST ${API_URL}/blockchain/blockchain-requests/${blockchainRequest.id}/pay`);
      console.log('Request Body:');
      console.log(JSON.stringify({
        sponsorPrivateKey: billData.sponsorWallet.privateKey
      }, null, 2));
      
      console.log('\nTo pay this bill using the next script:');
      console.log(`Run: npx ts-node scripts/6-pay-bill.ts`);
      console.log('And select blockchain request ID:', blockchainRequest.id);
      
      return blockchainRequest;
      
    } catch (error: any) {
      console.error('Failed to submit bill to blockchain:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('Error submitting bill to blockchain:', error.message);
  } finally {
    rl.close();
  }
}

submitBillToBlockchain(); 