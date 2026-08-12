import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError, ZodIssue } from 'zod';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e: ZodIssue) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      data: {},
    });
  }

  // Prisma: Unique constraint violation 
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value: ${target} already exists`,
        data: {},
      });
    }

    // Prisma: Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        data: {},
      });
    }
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({
    success: false,
    message: message,
    data: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};
