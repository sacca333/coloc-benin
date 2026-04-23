import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { bloquer, debloquer, listeBlocages, verifieBlocage } from './blocages.controller';

export const blocagesRouter = Router();
blocagesRouter.use(authenticate);

blocagesRouter.post('/', bloquer);
blocagesRouter.delete('/:bloqueId', debloquer);
blocagesRouter.get('/', listeBlocages);
blocagesRouter.get('/verifie/:userId', verifieBlocage);
