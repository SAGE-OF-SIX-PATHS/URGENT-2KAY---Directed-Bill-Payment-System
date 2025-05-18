import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestBill() {
  try {
    // First check if bill already exists
    const existingBill = await prisma.bill.findUnique({
      where: { id: 'test-bill-id' }
    });

    if (existingBill) {
      console.log('Test bill already exists:', existingBill);
      return existingBill;
    }

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
        id: 'test-bill-id',
        description: 'Test Bill for Blockchain Payment',
        amount: 0.01,
        status: 'PENDING',
        userId: 'test-user-id',
        category: 'UTILITIES'
      }
    });
    
    console.log('Test bill created:', bill);
    return bill;
  } catch (error) {
    console.error('Error creating test bill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBill(); 