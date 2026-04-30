import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { annoncesRouter } from './modules/annonces/annonces.router';
import { colocationsRouter } from './modules/colocations/colocations.router';
import { abonnementsRouter } from './modules/abonnements/abonnements.router';
import { messagerieRouter } from './modules/messagerie/messagerie.router';
import { adminRouter } from './modules/admin/admin.router';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'development' ? 1000 : 100 });
app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/annonces', annoncesRouter);
app.use('/api/colocations', colocationsRouter);
app.use('/api/abonnements', abonnementsRouter);
app.use('/api/messagerie', messagerieRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`ColocBénin API démarrée sur le port ${PORT}`);
});

export default app;