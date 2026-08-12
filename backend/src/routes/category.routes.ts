import express from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('ADMIN'), CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.patch('/:id', authenticate, authorizeRoles('ADMIN'), CategoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), CategoryController.deleteCategory);

export default router;
