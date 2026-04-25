import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const toutesNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json(notifications);
  } catch (error) {
    console.error('[toutesNotifications]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const nonLuesCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({ where: { userId: req.user!.id, lu: false } });
    return res.json({ count });
  } catch (error) {
    console.error('[nonLuesCount]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const marquerLu = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id }, data: { lu: true } });
    return res.json({ ok: true });
  } catch (error) {
    console.error('[marquerLu]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const toutMarquerLu = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, lu: false }, data: { lu: true } });
    return res.json({ ok: true });
  } catch (error) {
    console.error('[toutMarquerLu]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
