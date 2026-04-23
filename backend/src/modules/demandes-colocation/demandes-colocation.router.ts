import { Router } from 'express';
import { authenticate, requireAbonnementActif } from '../../middlewares/auth.middleware';
import { envoyerDemande, accepterDemande, rejeterDemande, demandesRecues, demandesEnvoyees } from './demandes-colocation.controller';

export const demandesColocationRouter = Router();
demandesColocationRouter.use(authenticate);

demandesColocationRouter.post('/', requireAbonnementActif, envoyerDemande);
demandesColocationRouter.post('/:id/accepter', accepterDemande);
demandesColocationRouter.post('/:id/rejeter', rejeterDemande);
demandesColocationRouter.get('/recues', demandesRecues);
demandesColocationRouter.get('/envoyees', demandesEnvoyees);
