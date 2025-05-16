import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNewTestBill() {
  try {
    // Generate a unique ID with timestamp
    const newBillId = `test-bill-id-${Date.now()}`;
    
    // Make sure test user exists
    const user = await prisma.user.findUnique({
      where: { id: 'test-user-id' }
    });

    if (!user) {
      console.error('Test user not found. Please run create-test-user.ts first');
      return;
    }

    // Create test bill
    const bill = await prisma.bill.create({
      data: {
        id: newBillId,
        description: 'New Test Bill for Blockchain Payment',
        amount: 0.005,
        status: 'PENDING',
        userId: 'test-user-id',
        category: 'UTILITIES'
      }
    });
    
    console.log('New test bill created:');
    console.log(JSON.stringify(bill, null, 2));
    console.log(`\nUse this bill ID for testing: ${newBillId}`);
    console.log(`\nAPI endpoint to create bill request:`);
    console.log(`POST http://localhost:5000/blockchain/bills/${newBillId}/request`);
    console.log(`\nRequest body:`);
    console.log(JSON.stringify({
      beneficiaryAddress: "0xFcF9024F5CEA16b5767823e61b0e24Ef1ac6fDC5",
      sponsorAddress: "0x915f27E1A7f4935DCaddD63A5741ac74d74cE39B",
      paymentDestination: "0xFcF9024F5CEA16b5767823e61b0e24Ef1ac6fDC5",
      amount: 0.005,
      description: "Test Payment"
    }, null, 2));
    
    return bill;
  } catch (error) {
    console.error('Error creating new test bill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewTestBill(); 