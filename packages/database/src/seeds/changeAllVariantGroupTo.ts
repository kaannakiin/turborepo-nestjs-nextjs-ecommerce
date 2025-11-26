import { prisma } from "../client.js";

async function main() {
  const variantGroups = await prisma.productVariantGroup.updateMany({
    data: {
      renderVisibleType: "BADGE",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
