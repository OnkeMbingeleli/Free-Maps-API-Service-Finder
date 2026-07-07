import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listPendingSuggestions,
  approveSuggestion,
  rejectSuggestion,
  dataSourceHealth,
} from '../controllers/adminController.js';

const router = Router();

// every admin route requires auth + admin/moderator role
router.use(requireAuth, requireRole('admin', 'moderator'));

router.get('/suggestions', listPendingSuggestions);
router.post('/suggestions/:id/approve', approveSuggestion);
router.post('/suggestions/:id/reject', rejectSuggestion);
router.get('/data-source-health', dataSourceHealth);

export default router;
