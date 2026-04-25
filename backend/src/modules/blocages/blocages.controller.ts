import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const bloquer = async (req: AuthRequest, res: Response) => {
  try {
    const bloqueurId = req.user!.id;
    const { bloqueId } = req.body;
    if (bloqueurId === bloqueId) return res.status(400).json({ error: 'Action impossible' });
    const dejaBloque = await prisma.blocage.findUnique({ where: { bloqueurId_bloqueId: { bloqueurId, bloqueId } } });
    if (dejaBloque) return res.status(409).json({ error: 'Deja bloque' });
    const blocage = await prisma.blocage.create({
      data: { bloqueurId, bloqueId },
      include: { bloque: { select: { id: true, nom: true, prenom: true, photo: true } } },
    });
    return res.status(201).json(blocage);
  } catch (error) {
    console.error('[bloquer]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const debloquer = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.blocage.deleteMany({ where: { bloqueurId: req.user!.id, bloqueId: req.params.bloqueId } });
    return res.json({ message: 'Utilisateur debloque' });
  } catch (error) {
    console.error('[debloquer]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const listeBlocages = async (req: AuthRequest, res: Response) => {
  try {
    const blocages = await prisma.blocage.findMany({
      where: { bloqueurId: req.user!.id },
      include: { bloque: { select: { id: true, nom: true, prenom: true, photo: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(blocages);
  } catch (error) {
    console.error('[listeBlocages]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const verifieBlocage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const autreId = req.params.userId;
    const jaiBloque = await prisma.blocage.findUnique({ where: { bloqueurId_bloqueId: { bloqueurId: userId, bloqueId: autreId } } });
    const mEstBloque = await prisma.blocage.findUnique({ where: { bloqueurId_bloqueId: { bloqueurId: autreId, bloqueId: userId } } });
    return res.json({ jaiBloque: !!jaiBloque, mEstBloque: !!mEstBloque });
  } catch (error) {
    console.error('[verifieBlocage]', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
