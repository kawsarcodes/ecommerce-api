import express from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/products', authenticate, authorizeRoles('ADMIN'), StatsController.getProductStats);

export default router;