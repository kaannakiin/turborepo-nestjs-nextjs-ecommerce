import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

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
