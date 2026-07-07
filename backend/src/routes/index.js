import { Router } from 'express';
import servicesRoutes from './services.js';
import forumRoutes from './forum.js';
import adminRoutes from './admin.js';
import { healthCheck } from '../monitoring/healthCheck.js';

const router = Router();

router.get('/health', healthCheck);
router.use('/services', servicesRoutes);
router.use('/forum', forumRoutes);
router.use('/admin', adminRoutes);

export default router;
