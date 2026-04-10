import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { sendVerificationEmail } from '../../utils/mailer';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, ville, universite, filiere, niveau } = req.body;

    const existant = await prisma.utilisateur.findUnique({ where: { email } });
    if (existant) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    const hash = await bcrypt.hash(motDePasse, 12);
    const token = uuidv4();

    const utilisateur = await prisma.utilisateur.create({
      data: { nom, prenom, email, motDePasse: hash, telephone, ville, universite, filiere, niveau, tokenVerifEmail: token },
      select: { id: true, nom: true, prenom: true, email: true },
    });

    await sendVerificationEmail(email, nom, token);

    res.status(201).json({
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
      utilisateur,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user || !user.actif) return res.status(401).json({ error: 'Identifiants invalides' });
    if (!user.emailVerifie) return res.status(401).json({ error: 'Veuillez vérifier votre email avant de vous connecter' });

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { id: user.id, email: user.email, typeCompte: user.typeCompte },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN as any || '7d' }
    );

    // Vérifier statut abonnement
    const abonnement = await prisma.abonnement.findFirst({
      where: { utilisateurId: user.id, statut: 'ACTIF', periodeFin: { gte: new Date() } },
      select: { statut: true, periodeFin: true },
    });

    res.json({
      token,
      utilisateur: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, typeCompte: user.typeCompte },
      abonnementActif: !!abonnement,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur de connexion' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const user = await prisma.utilisateur.findFirst({ where: { tokenVerifEmail: token } });
    if (!user) return res.status(400).json({ error: 'Lien de vérification invalide ou expiré' });

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { emailVerifie: true, tokenVerifEmail: null },
    });

    res.json({ message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur de vérification' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.utilisateur.findUnique({
    where: { id: req.user!.id },
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, ville: true, universite: true, niveau: true, typeCompte: true, photo: true, createdAt: true },
  });
  res.json(user);
};
