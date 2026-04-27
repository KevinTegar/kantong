import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getBurnRate,
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
} from '../controllers/alertController';

const router = Router();

router.get('/burn-rate', authMiddleware, getBurnRate);
router.get('/', authMiddleware, getAlerts);
router.put('/:id/read', authMiddleware, markAlertRead);
router.put('/read-all', authMiddleware, markAllAlertsRead);

export default router;