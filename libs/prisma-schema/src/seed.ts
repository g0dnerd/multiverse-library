import { PrismaClient } from '../../prisma-client/src/lib/generated/client';

const prisma = new PrismaClient();

async function main() {
  const card1 = await prisma.card.upsert({
    where: {
      name: 'Uncle Istvan',
    },
    update: {},
    create: {
      name: 'Uncle Istvan',
    },
  });

  console.log({ card1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
