import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { toutesNotifications, nonLuesCount, marquerLu, toutMarquerLu } from './notifications.controller';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get('/', toutesNotifications);
notificationsRouter.get('/non-lues/count', nonLuesCount);
notificationsRouter.patch('/:id/lu', marquerLu);
notificationsRouter.patch('/tout-lu', toutMarquerLu);
