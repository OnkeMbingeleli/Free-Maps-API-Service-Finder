import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listServices, suggestService, reportService } from '../controllers/servicesController.js';

const router = Router();

router.get('/', listServices);
router.post('/suggest', requireAuth, suggestService);
router.post('/:id/report', requireAuth, reportService);

export default router;
