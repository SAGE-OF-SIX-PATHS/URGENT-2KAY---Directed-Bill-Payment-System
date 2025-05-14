import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

// You can customize this private key if needed
const SPONSOR_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat account #0

// Get the request ID from command line arguments
const requestId = process.argv[2];

if (!requestId) {
  console.error('Please provide a request ID as a command line argument.');
  console.error('Usage: npx ts-node backend/scripts/cancel-specific-request.ts REQUEST_ID');
  process.exit(1);
}

async function cancelSpecificRequest(id: string) {
  try {
    console.log(`Looking up blockchain request with ID: ${id}`);
    
    const request = await prisma.blockchainRequest.findUnique({
      where: {
        id
      },
      include: {
        bill: true
      }
    });
    
    if (!request) {
      console.error(`Request with ID ${id} not found.`);
      return;
    }
    
    if (request.status !== 'PENDING') {
      console.log(`Request ${id} has status "${request.status}" and cannot be cancelled.`);
      console.log('Only PENDING requests can be cancelled.');
      return;
    }
    
    console.log(`\nRequest details:`);
    console.log(`ID: ${request.id}`);
    console.log(`Bill ID: ${request.billId}`);
    console.log(`Status: ${request.status}`);
    console.log(`Created: ${request.createdAt}`);
    
    console.log(`\nAttempting to cancel request ${id}...`);
    
    try {
      const response = await axios.post(
        `${API_URL}/blockchain/blockchain-requests/${id}/reject`,
        { sponsorPrivateKey: SPONSOR_PRIVATE_KEY }
      );
      
      console.log(`\n✅ Successfully cancelled request ${id}.`);
      console.log(`Response:`, response.data);
    } catch (error) {
      console.error(`\n❌ Failed to cancel request ${id}:`, error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error in cancel operation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cancelSpecificRequest(requestId); 