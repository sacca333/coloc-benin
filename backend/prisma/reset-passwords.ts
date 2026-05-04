import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('Test1234!', 12);

    await prisma.utilisateur.updateMany({
        data: { motDePasse: hash },
    });

    console.log('Mots de passe réinitialisés pour tous les utilisateurs : Test1234!');
}

main().catch(console.error).finally(() => prisma.$disconnect());