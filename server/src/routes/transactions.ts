import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

const router = Router();

router.get('/', authMiddleware, getTransactions);
router.post('/', authMiddleware, createTransaction);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

export default router;