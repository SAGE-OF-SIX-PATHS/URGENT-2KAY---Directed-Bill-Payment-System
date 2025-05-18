import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createQuickBill() {
  try {
    // Generate a unique ID with timestamp
    const newBillId = `test-bill-id-${Date.now()}`;
    
    // Create a test user if not exists
    let user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No user found. Creating a test user...');
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'BENEFACTEE'
        }
      });
      console.log('Created test user:', user);
    } else {
      console.log('Using existing user:', user);
    }

    // Create test bill
    const bill = await prisma.bill.create({
      data: {
        id: newBillId,
        description: 'Test Bill for Blockchain Payment',
        amount: 0.005,
        status: 'PENDING',
        userId: user.id,
        category: 'UTILITIES'
      }
    });
    
    console.log('\n✅ New test bill created:');
    console.log(JSON.stringify(bill, null, 2));
    console.log(`\nBill ID for testing: ${newBillId}`);
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

// Run the function
createQuickBill(); 