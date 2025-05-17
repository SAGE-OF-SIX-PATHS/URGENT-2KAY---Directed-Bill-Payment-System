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

async function checkRequestStatus() {
  try {
    console.log('=== Check Blockchain Request Status ===');
    
    // Check for blockchain request files
    const walletDir = path.join(__dirname, 'wallets');
    const billsDir = path.join(walletDir, 'bills');
    
    if (!fs.existsSync(billsDir)) {
      console.error('No bills directory found! Please create a bill first using 4-create-bill.ts.');
      return;
    }
    
    const requestFiles = fs.readdirSync(billsDir).filter(f => f.startsWith('blockchain-request-'));
    
    if (requestFiles.length === 0) {
      console.error('No blockchain requests found! Please submit a bill first using 5-submit-bill-to-blockchain.ts.');
      return;
    }
    
    // List all blockchain requests
    console.log('\nAvailable blockchain requests:');
    requestFiles.forEach((file, index) => {
      const requestData = JSON.parse(fs.readFileSync(path.join(billsDir, file), 'utf8'));
      console.log(`${index + 1}. ${requestData.bill.description} - ${requestData.amount} ETH (${file})`);
      console.log(`   Status: ${requestData.status}`);
    });
    
    // Ask user to select a request
    const requestIndex = parseInt(await question('\nSelect a blockchain request by number: ')) - 1;
    
    if (requestIndex < 0 || requestIndex >= requestFiles.length) {
      console.error('Invalid selection!');
      return;
    }
    
    // Load the selected request
    const requestFile = requestFiles[requestIndex];
    const requestData = JSON.parse(fs.readFileSync(path.join(billsDir, requestFile), 'utf8'));
    
    console.log('\nSelected request:');
    console.log(`Blockchain Request ID: ${requestData.id}`);
    console.log(`Bill ID: ${requestData.bill.id}`);
    console.log(`Description: ${requestData.bill.description}`);
    console.log(`Amount: ${requestData.amount} ETH`);
    console.log(`Current Status: ${requestData.status}`);
    
    if (requestData.transactionHash) {
      console.log(`Transaction Hash: ${requestData.transactionHash}`);
    }
    
    // Get the current status from the API
    console.log('\nFetching latest status from the API...');
    
    try {
      const response = await axios.get(`${API_URL}/blockchain/blockchain-requests/${requestData.id}`);
      const latestData = response.data;
      
      console.log('\nLatest status from API:');
      console.log(`Status: ${latestData.status}`);
      
      if (latestData.transactionHash) {
        console.log(`Transaction Hash: ${latestData.transactionHash}`);
      }
      
      // Check if status has changed
      if (latestData.status !== requestData.status) {
        console.log(`\n✅ Status has changed from ${requestData.status} to ${latestData.status}`);
        
        // Update the local file
        requestData.status = latestData.status;
        requestData.transactionHash = latestData.transactionHash;
        fs.writeFileSync(path.join(billsDir, requestFile), JSON.stringify(requestData, null, 2));
        
        console.log('Local file updated with latest status.');
      } else {
        console.log(`\nStatus remains ${latestData.status}`);
      }
      
      // If the transaction is confirmed, show more details
      if (latestData.status === 'CONFIRMED' && latestData.transactionHash) {
        console.log('\n=== Transaction Confirmed ===');
        console.log('The bill has been successfully paid on the blockchain.');
        
        // You can add code here to fetch transaction details from a blockchain explorer
        console.log('\nTo view the transaction details on a blockchain explorer:');
        console.log(`https://sepolia.etherscan.io/tx/${latestData.transactionHash}`);
      }
      
      return latestData;
      
    } catch (error: any) {
      console.error('Failed to fetch latest status:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('Error checking request status:', error.message);
  } finally {
    rl.close();
  }
}

checkRequestStatus(); 