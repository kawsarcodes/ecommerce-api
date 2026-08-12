import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';

const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user?.userId,
    };
    const result = await ReviewService.createReview(payload);
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.getAllReviews();
    res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.getReviewById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Review fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.updateReview(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.deleteReview(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
