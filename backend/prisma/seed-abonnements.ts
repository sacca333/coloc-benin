import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const utilisateurs = await prisma.utilisateur.findMany({
        where: { actif: true },
        select: { id: true, email: true },
    });

    const maintenant = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 1);

    for (const user of utilisateurs) {
        await prisma.abonnement.create({
            data: {
                utilisateurId: user.id,
                operateur: 'MOMO',
                montant: 300,
                statut: 'ACTIF',
                datePaiement: maintenant,
                periodeDebut: maintenant,
                periodeFin: fin,
            },
        });
        console.log(`Abonnement créé pour : ${user.email}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());