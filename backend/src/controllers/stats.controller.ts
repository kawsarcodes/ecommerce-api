import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

const getProductStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await StatsService.getProductStats();
    res.status(200).json({
      success: true,
      message: 'Product stats fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const StatsController = { getProductStats };