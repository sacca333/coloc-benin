import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { sauvegardesRouter } from './modules/sauvegardes/sauvegardes.router';

import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { annoncesRouter } from './modules/annonces/annonces.router';
import { colocationsRouter } from './modules/colocations/colocations.router';
import { abonnementsRouter, webhooksRouter } from './modules/abonnements/abonnements.router';
import { messagerieRouter } from './modules/messagerie/messagerie.router';
import { adminRouter } from './modules/admin/admin.router';
import { blocagesRouter } from './modules/blocages/blocages.router';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;

// â”€â”€ SÃ©curitÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));
const defaultAllowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envAllowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

/** En dev, Next peut passer sur 3002, 3003â€¦ si les ports prÃ©cÃ©dents sont pris. */
const isLocalhostDevOrigin = (o: string) => /^http:\/\/localhost:\d+$/.test(o);

app.use(cors({
  origin: [
    'https://colocbenin.com',
    'https://www.colocbenin.com',
    'http://localhost:3000',
  ],
  credentials: true,
}));

// Webhooks avant le parsing JSON global (pour accÃ¨s au body brut si besoin)
app.use('/webhooks', express.json(), webhooksRouter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting gÃ©nÃ©ral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // 500 en dev, 100 en prod
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // ignorer health check
});
app.use('/api/', limiter);

// Rate limiting strict pour l'auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives, rÃ©essayez dans 15 minutes' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// â”€â”€ Fichiers statiques (photos uploadÃ©es) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CORS middleware for static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// â”€â”€ Routes API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/annonces', annoncesRouter);
app.use('/api/colocations', colocationsRouter);
app.use('/api/abonnements', abonnementsRouter);
app.use('/api/messagerie', messagerieRouter);
app.use('/api/admin', adminRouter);
app.use('/api/blocages', blocagesRouter);
app.use('/api/sauvegardes', sauvegardesRouter);

// â”€â”€ Health check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// â”€â”€ 404 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// â”€â”€ Gestion d'erreurs globale â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`ColocBÃ©nin API dÃ©marrÃ©e â€” port ${PORT} â€” ${process.env.NODE_ENV || 'development'}`);
});

export default app;




