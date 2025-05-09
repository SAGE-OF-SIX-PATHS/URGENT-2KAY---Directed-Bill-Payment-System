import { prisma } from "../src/lib/prisma";

async function main() {
const provider = await prisma.provider.create({
data: {
name: "PHCN Electricity",
verified: true,
},
});

console.log("✅ Dummy provider created:");
console.log(provider);
}

main()
.catch((e) => {
console.error("❌ Error seeding provider:", e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});