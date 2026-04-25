const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Coloc2024!', 12);
  const result = await prisma.utilisateur.updateMany({
    data: { motDePasse: hash }
  });
  console.log('Mis a jour:', result.count, 'comptes');
  await prisma.$disconnect();
}

main().catch(console.error).finally(() => process.exit());
