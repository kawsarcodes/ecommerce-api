import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validation/product.validation';

const router = express.Router();

router.post('/', authenticate, validate(createProductSchema), ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.patch('/:id', authenticate, validate(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', authenticate, ProductController.deleteProduct);

export default router;
