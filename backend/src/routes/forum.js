import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { forumPostLimiter } from '../middleware/rateLimit.js';
import { listThreads, createThread, postMessage, flagMessage } from '../controllers/forumController.js';

const router = Router();

router.get('/threads', listThreads);
router.post('/threads', requireAuth, createThread);
router.post('/threads/:threadId/messages', requireAuth, forumPostLimiter, postMessage);
router.post('/messages/:messageId/flag', requireAuth, flagMessage);

export default router;
