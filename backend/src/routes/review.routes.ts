import express from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticate, ReviewController.createReview);
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);
router.patch('/:id', authenticate, ReviewController.updateReview);
router.delete('/:id', authenticate, ReviewController.deleteReview);

export default router;
