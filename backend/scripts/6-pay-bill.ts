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

async function payBill() {
  try {
    console.log('=== Pay Bill on Blockchain ===');
    
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
    
    // Check if the request is already paid
    if (requestData.status !== 'PENDING') {
      console.log(`\nThis request has status "${requestData.status}" and cannot be paid.`);
      console.log('Only PENDING requests can be paid.');
      return;
    }
    
    console.log('\nSelected request:');
    console.log(`Blockchain Request ID: ${requestData.id}`);
    console.log(`Bill ID: ${requestData.bill.id}`);
    console.log(`Description: ${requestData.bill.description}`);
    console.log(`Amount: ${requestData.amount} ETH`);
    console.log(`Recipient: ${requestData.bill.userWallet.address}`);
    console.log(`Sponsor: ${requestData.bill.sponsorWallet.address}`);
    
    // Confirm payment
    const confirm = await question('\nDo you want to pay this bill? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('Payment cancelled.');
      return;
    }
    
    // Make payment
    console.log('\nProcessing payment...');
    
    const paymentData = {
      sponsorPrivateKey: requestData.bill.sponsorWallet.privateKey
    };
    
    try {
      console.log('POST', `${API_URL}/blockchain/blockchain-requests/${requestData.id}/pay`);
      console.log('Request Body:', {
        sponsorPrivateKey: '0x...private key hidden...'
      });
      
      const paymentStart = Date.now();
      const response = await axios.post(
        `${API_URL}/blockchain/blockchain-requests/${requestData.id}/pay`,
        paymentData
      );
      const paymentEnd = Date.now();
      
      const paymentResult = response.data;
      console.log('\n✅ Payment processed successfully!');
      console.log('Transaction Hash:', paymentResult.transactionHash);
      console.log('Status:', paymentResult.status);
      console.log(`Time taken: ${(paymentEnd - paymentStart) / 1000} seconds`);
      
      // Update the blockchain request file with payment information
      requestData.status = paymentResult.status;
      requestData.transactionHash = paymentResult.transactionHash;
      requestData.paidAt = new Date().toISOString();
      fs.writeFileSync(path.join(billsDir, requestFile), JSON.stringify(requestData, null, 2));
      
      console.log('\nBlockchain request file updated with payment information.');
      
      // Suggest next steps
      console.log('\n=== NEXT STEPS ===');
      console.log('1. Check the transaction status with the transaction hash');
      console.log('2. View the blockchain request details in your application');
      console.log('3. Wait for the transaction to be confirmed on the blockchain');
      
      return paymentResult;
      
    } catch (error: any) {
      console.error('\n❌ Payment failed:', error.response?.data || error.message);
      
      // Show detailed error information if available
      if (error.response?.data) {
        console.error('\nDetailed error information:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      
      console.log('\nPossible reasons for payment failure:');
      console.log('1. Insufficient funds in the sponsor wallet');
      console.log('2. The sponsor address does not match the bill\'s sponsor address');
      console.log('3. Network or blockchain node issues');
      console.log('4. Transaction gas limit or price issues');
      
      console.log('\nPlease check your wallet balance and try again.');
    }
    
  } catch (error: any) {
    console.error('Error processing payment:', error.message);
  } finally {
    rl.close();
  }
}

payBill(); 