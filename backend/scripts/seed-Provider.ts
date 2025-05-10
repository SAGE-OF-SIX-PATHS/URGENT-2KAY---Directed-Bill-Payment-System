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



// for multiple providers
/*import { prisma } from "../src/lib/prisma";

async function main() {
  const providers = [
    { name: "PHCN Electricity", verified: true },
    { name: "DSTV", verified: true },
    { name: "MTN Airtime", verified: true },
    { name: "Ikeja Electric", verified: true },
    { name: "GLO Data", verified: false },
  ];

  const created = await prisma.provider.createMany({
    data: providers,
    skipDuplicates: true, 
  });

  console.log(`✅ Seeded ${created.count} providers`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding providers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/