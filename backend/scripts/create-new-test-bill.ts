import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNewTestBill() {
  try {
    // Generate a unique ID
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
        amount: 0.01,
        status: 'PENDING',
        userId: 'test-user-id',
        category: 'UTILITIES'
      }
    });
    
    console.log('New test bill created:', bill);
    console.log(`Use this bill ID for testing: ${newBillId}`);
    return bill;
  } catch (error) {
    console.error('Error creating new test bill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewTestBill(); 