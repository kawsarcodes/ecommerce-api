import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user?.userId,
    };
    const result = await ProductService.createProduct(payload);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductService.getAllProducts(req.query);
    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: result.products,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
