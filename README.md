# ColocBénin — Mini-SaaS de gestion de colocation étudiante

## Stack technique
- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL (via Prisma ORM)
- **Paiement** : MTN MoMo · C'cash (Celtiis) · Moov Money
- **Auth** : JWT + bcrypt
- **Email** : Nodemailer (SMTP)
- **Upload** : Multer + stockage local (ou S3-compatible)

## Structure du projet

```
coloc-benin/
├── backend/          # API Express
│   └── src/
│       ├── config/           # DB, JWT, email, env
│       ├── middlewares/      # auth, validation, rate-limit
│       ├── modules/
│       │   ├── auth/         # inscription, login, vérif email
│       │   ├── users/        # profil, préférences
│       │   ├── annonces/     # CRUD annonces + upload photos
│       │   ├── colocations/  # groupes, invitations, loyer
│       │   ├── abonnements/  # paiement, statut, historique
│       │   ├── messagerie/   # messages internes
│       │   └── admin/        # dashboard admin
│       ├── services/
│       │   └── payment/      # MoMo, C'cash, Moov (adaptateurs)
│       └── utils/            # helpers, mailer, upload
│
└── frontend/         # Next.js App
    └── src/
        ├── app/
        │   ├── auth/         # login, inscription
        │   ├── dashboard/    # tableau de bord utilisateur
        │   ├── annonces/     # liste + détail + création
        │   ├── colocations/  # gestion groupe
        │   ├── abonnement/   # paiement + historique
        │   └── admin/        # espace administrateur
        ├── components/
        │   ├── ui/           # Button, Card, Badge, Modal...
        │   ├── layout/       # Navbar, Sidebar, Footer
        │   └── forms/        # formulaires réutilisables
        ├── lib/              # axios instance, helpers
        ├── hooks/            # useAuth, useAbonnement...
        └── types/            # types TypeScript partagés
```

## Lancement rapide

```bash
# Backend
cd backend
cp .env.example .env   # configurer les variables
npm install
npm run dev            # port 4000

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev            # port 3000
```

## Variables d'environnement requises

Voir `backend/.env.example` et `frontend/.env.example`.

## Points critiques à résoudre avant production

1. Obtenir les credentials sandbox MTN MoMo Bénin, C'cash et Moov Money
2. Configurer les webhooks de confirmation de paiement
3. Rédiger la politique de confidentialité (données personnelles étudiants)
4. Définir la période de grâce après expiration d'abonnement
