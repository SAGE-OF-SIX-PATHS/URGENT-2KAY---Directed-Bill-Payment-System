import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listBlockchainRequests() {
  try {
    console.log('Fetching blockchain requests from database...');
    
    const requests = await prisma.blockchainRequest.findMany({
      include: {
        bill: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (requests.length === 0) {
      console.log('No blockchain requests found in the database.');
      return;
    }
    
    console.log(`Found ${requests.length} blockchain requests:`);
    
    for (const request of requests) {
      console.log(`\n-------------------------------------`);
      console.log(`Blockchain Request ID: ${request.id}`);
      console.log(`Bill ID: ${request.billId}`);
      console.log(`Status: ${request.status}`);
      console.log(`Transaction Hash: ${request.transactionHash || 'None'}`);
      console.log(`Created: ${request.createdAt}`);
      
      if (request.status === 'PENDING') {
        console.log(`\nTo cancel/reject this request, use:`);
        console.log(`POST http://localhost:5000/blockchain/blockchain-requests/${request.id}/reject`);
        console.log(`Request body:`);
        console.log(JSON.stringify({
          sponsorPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" // Hardhat account #0
        }, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error fetching blockchain requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listBlockchainRequests(); 