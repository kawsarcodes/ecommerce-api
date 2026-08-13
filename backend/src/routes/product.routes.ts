import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validation/product.validation';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('ADMIN'), validate(createProductSchema), ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.patch('/:id', authenticate, authorizeRoles('ADMIN'), validate(updateProductSchema), ProductController.updateProduct);
router.patch('/:id/restore', authenticate, authorizeRoles('ADMIN'), ProductController.restoreProduct);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), ProductController.deleteProduct);

export default router;