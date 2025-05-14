import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

// You can customize this private key if needed
const SPONSOR_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat account #0

async function cancelPendingRequests() {
  try {
    console.log('Fetching pending blockchain requests...');
    
    const pendingRequests = await prisma.blockchainRequest.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        bill: true
      }
    });
    
    if (pendingRequests.length === 0) {
      console.log('No pending blockchain requests found.');
      return;
    }
    
    console.log(`Found ${pendingRequests.length} pending requests. Cancelling...`);
    
    for (const request of pendingRequests) {
      console.log(`\nCancelling request ${request.id} for bill ${request.billId}...`);
      
      try {
        const response = await axios.post(
          `${API_URL}/blockchain/blockchain-requests/${request.id}/reject`,
          { sponsorPrivateKey: SPONSOR_PRIVATE_KEY }
        );
        
        console.log(`✅ Successfully cancelled request ${request.id}.`);
        console.log(`Response:`, response.data);
      } catch (error) {
        console.error(`❌ Failed to cancel request ${request.id}:`, error.response?.data || error.message);
      }
    }
    
    console.log('\nOperation completed.');
    
  } catch (error) {
    console.error('Error in cancel operation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cancelPendingRequests(); 