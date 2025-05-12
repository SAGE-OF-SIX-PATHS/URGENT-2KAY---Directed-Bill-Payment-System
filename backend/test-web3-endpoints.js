const axios = require('axios');

// Base URL for API requests
const API_URL = 'http://localhost:5000';

// Test user data
const testUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com'
};

// Test bill data
const testBill = {
  id: 'test-bill-id',
  amount: 0.01, // Small amount for testing
  description: 'Test Bill Payment',
};

// Test addresses
const testBeneficiaryAddress = '0x123...'; // Replace with a valid address if testing with real blockchain
const testSponsorAddress = '0x456...';     // Replace with a valid address if testing with real blockchain
const testPaymentDestination = '0x789...'; // Replace with a valid address if testing with real blockchain

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to log results
const logResult = (test, success, response) => {
  console.log(`\n${colors.blue}Test:${colors.reset} ${test}`);
  if (success) {
    console.log(`${colors.green}Status:${colors.reset} PASSED`);
  } else {
    console.log(`${colors.red}Status:${colors.reset} FAILED`);
  }
  console.log(`${colors.yellow}Response:${colors.reset}`, response);
};

// Run tests sequentially
async function runTests() {
  try {
    console.log(`${colors.blue}====== TESTING WEB3 ENDPOINTS ======${colors.reset}\n`);
    
    // Test 1: Health check
    try {
      console.log(`${colors.yellow}Testing server health...${colors.reset}`);
      const healthResponse = await axios.get(API_URL);
      logResult('Server Health', true, healthResponse.data);
    } catch (error) {
      logResult('Server Health', false, error.message);
      console.log(`${colors.red}Server not running. Please start the server with 'npm run web3-test'${colors.reset}`);
      return;
    }

    // Test 2: Create wallet
    console.log(`${colors.yellow}Testing wallet creation...${colors.reset}`);
    try {
      const walletResponse = await axios.post(`${API_URL}/blockchain/wallets/${testUser.id}`);
      logResult('Create Wallet', walletResponse.status === 200, walletResponse.data);
      
      // Store the wallet data for later tests
      const walletData = walletResponse.data;
      
      // Test 3: Get wallet balance
      console.log(`${colors.yellow}Testing wallet balance...${colors.reset}`);
      try {
        const balanceResponse = await axios.get(`${API_URL}/blockchain/wallets/${testUser.id}/balance`);
        logResult('Get Wallet Balance', balanceResponse.status === 200, balanceResponse.data);
      } catch (error) {
        logResult('Get Wallet Balance', false, error.response?.data || error.message);
      }
      
      // Test 4: Create bill request
      console.log(`${colors.yellow}Testing bill request creation...${colors.reset}`);
      try {
        const billRequestData = {
          beneficiaryAddress: walletData.address || testBeneficiaryAddress,
          sponsorAddress: testSponsorAddress,
          paymentDestination: testPaymentDestination,
          amount: testBill.amount,
          description: testBill.description
        };
        
        const billResponse = await axios.post(
          `${API_URL}/blockchain/bills/${testBill.id}/request`, 
          billRequestData
        );
        
        logResult('Create Bill Request', billResponse.status === 201, billResponse.data);
        
        // If successful, store the blockchain request ID
        if (billResponse.status === 201) {
          const blockchainRequestId = billResponse.data.transactionHash;
          
          // Test 5: Get bill details
          console.log(`${colors.yellow}Testing get bill details...${colors.reset}`);
          try {
            const billDetailsResponse = await axios.get(`${API_URL}/blockchain/blockchain-bills/${blockchainRequestId}`);
            logResult('Get Bill Details', billDetailsResponse.status === 200, billDetailsResponse.data);
          } catch (error) {
            logResult('Get Bill Details', false, error.response?.data || error.message);
          }
        }
      } catch (error) {
        logResult('Create Bill Request', false, error.response?.data || error.message);
      }
      
    } catch (error) {
      logResult('Create Wallet', false, error.response?.data || error.message);
    }
    
    console.log(`\n${colors.blue}====== WEB3 ENDPOINTS TEST COMPLETE ======${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Test Error:${colors.reset}`, error);
  }
}

// Run the tests
runTests(); 