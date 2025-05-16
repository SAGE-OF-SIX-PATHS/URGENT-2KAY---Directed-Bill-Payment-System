import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listBills() {
  try {
    console.log('Fetching bills from database...');
    
    const bills = await prisma.bill.findMany({
      include: {
        user: true,
        blockchainRequest: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Get the latest 10 bills
    });
    
    if (bills.length === 0) {
      console.log('No bills found in the database.');
      return;
    }
    
    console.log(`Found ${bills.length} bills:`);
    
    for (const bill of bills) {
      console.log(`\n-------------------------------------`);
      console.log(`Bill ID: ${bill.id}`);
      console.log(`Description: ${bill.description}`);
      console.log(`Amount: ${bill.amount}`);
      console.log(`Status: ${bill.status}`);
      console.log(`User: ${bill.user?.name} (${bill.userId})`);
      console.log(`Created: ${bill.createdAt}`);
      
      if (bill.blockchainRequest) {
        console.log(`\nBlockchain Request ID: ${bill.blockchainRequest.id}`);
        console.log(`Blockchain Status: ${bill.blockchainRequest.status}`);
        console.log(`Transaction Hash: ${bill.blockchainRequest.transactionHash || 'None'}`);
      } else {
        console.log(`\nNo blockchain request associated with this bill.`);
        console.log(`\nTo create a blockchain request, use:`);
        console.log(`POST http://localhost:5000/blockchain/bills/${bill.id}/request`);
        console.log(`\nRequest body:`);
        console.log(JSON.stringify({
          beneficiaryAddress: "0xFcF9024F5CEA16b5767823e61b0e24Ef1ac6fDC5",
          sponsorAddress: "0x915f27E1A7f4935DCaddD63A5741ac74d74cE39B",
          paymentDestination: "0xFcF9024F5CEA16b5767823e61b0e24Ef1ac6fDC5",
          amount: bill.amount,
          description: bill.description
        }, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error fetching bills:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listBills(); 