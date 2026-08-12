import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticate, ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.patch('/:id', authenticate, ProductController.updateProduct);
router.delete('/:id', authenticate, ProductController.deleteProduct);

export default router;
