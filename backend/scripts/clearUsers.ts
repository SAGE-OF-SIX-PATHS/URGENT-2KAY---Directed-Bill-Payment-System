// scripts/clearUsers.ts
import { prisma } from "../src/lib/prisma"; // adjust path if needed

async function clearUsers() {
  try {
    await prisma.user.deleteMany(); // Deletes all rows in the User table
    console.log("✅ All users deleted successfully.");
  } catch (error) {
    console.error("❌ Failed to delete users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers();
