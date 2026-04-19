import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { sendVerificationEmail, sendEmail } from '../../utils/mailer';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, ville, universite, filiere, niveau } = req.body;

    const existant = await prisma.utilisateur.findUnique({ where: { email } });
    if (existant) return res.status(409).json({ error: 'Cet email est dÃ©jÃ  utilisÃ©' });

    const hash = await bcrypt.hash(motDePasse, 12);
    const token = uuidv4();

    const utilisateur = await prisma.utilisateur.create({
      data: { nom, prenom, email, motDePasse: hash, telephone, ville, universite, filiere, niveau, tokenVerifEmail: token },
      select: { id: true, nom: true, prenom: true, email: true },
    });

    try {
      await sendVerificationEmail(email, nom, token);
    } catch (mailErr) {
      console.error(mailErr);
      if (process.env.NODE_ENV !== 'development') {
        return res.status(500).json({ error: "Impossible d'envoyer l'email de vÃ©rification" });
      }
      const base = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.warn(`[dev] SMTP indisponible â€” lien de vÃ©rification : ${base}/auth/verify-email/${token}`);
    }

    res.status(201).json({
      message: 'Compte crÃ©Ã©. VÃ©rifiez votre email pour activer votre compte.',
      utilisateur,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la crÃ©ation du compte' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user || !user.actif) return res.status(401).json({ error: 'Identifiants invalides' });
    if (!user.emailVerifie) return res.status(401).json({ error: 'Veuillez vÃ©rifier votre email avant de vous connecter' });

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { id: user.id, email: user.email, typeCompte: user.typeCompte },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN as any || '7d' }
    );

    // VÃ©rifier statut abonnement
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
    if (!user) return res.status(400).json({ error: 'Lien de vÃ©rification invalide ou expirÃ©' });

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { emailVerifie: true, tokenVerifEmail: null },
    });

    res.json({ message: 'Email vÃ©rifiÃ© avec succÃ¨s. Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur de vÃ©rification' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.utilisateur.findUnique({
    where: { id: req.user!.id },
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, ville: true, universite: true, niveau: true, typeCompte: true, photo: true, createdAt: true },
  });
  res.json(user);
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'Si cet email existe, un lien a ete envoye.' });
    const token = uuidv4();
    const expiry = new Date(Date.now() + 1000 * 60 * 60);
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { tokenVerifEmail: `reset:${token}:${expiry.toISOString()}` },
    });
    const lien = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    await sendEmail(email, 'Reinitialisation de votre mot de passe - ColocBenin', `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2>Reinitialisation du mot de passe</h2>
        <p>Bonjour ${user.prenom},</p>
        <p>Cliquez sur le lien ci-dessous pour reinitialiser votre mot de passe :</p>
        <a href="${lien}" style="display:inline-block;padding:12px 24px;background:#0369a1;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Reinitialiser mon mot de passe
        </a>
        <p style="margin-top:16px;color:#888;font-size:12px">Ce lien expire dans 1 heure. Si vous n avez pas fait cette demande, ignorez cet email.</p>
      </div>
    `);
    return res.json({ message: 'Si cet email existe, un lien a ete envoye.' });
  } catch (err) {
    console.error('[forgotPassword]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { nouveauMotDePasse } = req.body;
    const user = await prisma.utilisateur.findFirst({
      where: { tokenVerifEmail: { startsWith: `reset:${token}:` } },
    });
    if (!user || !user.tokenVerifEmail) return res.status(400).json({ error: 'Lien invalide ou expire' });
    const parts = user.tokenVerifEmail.split(':');
    const expiry = new Date(parts[2]);
    if (new Date() > expiry) return res.status(400).json({ error: 'Lien expire' });
    const hash = await bcrypt.hash(nouveauMotDePasse, 12);
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { motDePasse: hash, tokenVerifEmail: null },
    });
    return res.json({ message: 'Mot de passe reinitialise avec succes' });
  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

