// ── utils/mailer.ts ───────────────────────────────────────────────────────────
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

export async function sendVerificationEmail(email: string, nom: string, token: string) {
  const lien = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
  return sendEmail(email, 'Vérifiez votre email — ColocBénin', `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2>Bienvenue sur ColocBénin, ${nom} !</h2>
      <p>Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
      <a href="${lien}" style="display:inline-block;padding:12px 24px;background:#7F77DD;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
        Vérifier mon email
      </a>
      <p style="margin-top:16px;color:#888;font-size:12px">Ce lien est valable 24 heures.</p>
    </div>
  `);
}

export async function sendPaymentConfirmationEmail(email: string, nom: string, operateur: string, periodeFin: Date) {
  return sendEmail(email, 'Abonnement activé — ColocBénin', `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2>Abonnement confirmé !</h2>
      <p>Bonjour ${nom}, votre paiement via <strong>${operateur}</strong> de 300 FCFA a été reçu.</p>
      <p>Votre abonnement est actif jusqu'au <strong>${periodeFin.toLocaleDateString('fr-FR')}</strong>.</p>
    </div>
  `);
}
