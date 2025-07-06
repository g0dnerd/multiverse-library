import { PrismaClient } from '../../prisma-client/src/lib/generated/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.card.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
