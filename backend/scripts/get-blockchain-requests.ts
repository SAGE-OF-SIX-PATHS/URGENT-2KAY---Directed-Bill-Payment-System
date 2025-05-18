import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBlockchainRequests() {
  try {
    console.log('Fetching blockchain requests from database...');
    
    const requests = await prisma.blockchainRequest.findMany({
      include: {
        bill: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    if (requests.length === 0) {
      console.log('No blockchain requests found in the database.');
      return;
    }
    
    console.log(`Found ${requests.length} blockchain requests:`);
    
    for (const request of requests) {
      console.log(`\n-----------------------------------`);
      console.log(`Blockchain Request ID: ${request.id}`);
      console.log(`Bill ID: ${request.billId}`);
      console.log(`Status: ${request.status}`);
      console.log(`Transaction Hash: ${request.transactionHash}`);
      console.log(`Created At: ${request.createdAt}`);
      console.log(`\nFor use in Postman:`);
      console.log(`URL: http://localhost:5000/blockchain/blockchain-requests/${request.id}/pay-native`);
      console.log(`Request Body (add your private key):`);
      console.log(JSON.stringify({
        sponsorPrivateKey: "your-private-key-here",
        amount: request.amount.toString(),
        blockchainBillId: "1" // This is likely the blockchain ID, but needs to be confirmed
      }, null, 2));
    }
    
  } catch (error) {
    console.error('Error fetching blockchain requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getBlockchainRequests(); 