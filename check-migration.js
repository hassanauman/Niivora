const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT migration_name, checksum
    FROM "_prisma_migrations"
    WHERE migration_name = '0_init'
  `;

  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
