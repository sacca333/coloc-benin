import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('Admin1234!', 12);

    const admin = await prisma.utilisateur.upsert({
        where: { email: 'admin@colocbenin.bj' },
        update: {},
        create: {
            nom: 'Admin',
            prenom: 'Super',
            email: 'admin@colocbenin.bj',
            motDePasse: hash,
            emailVerifie: true,
            actif: true,
            typeCompte: 'ADMIN',
        },
    });

    console.log('Admin créé :', admin.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());