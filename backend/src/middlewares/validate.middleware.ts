import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.errors.map((e: ZodIssue) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
        data: {},
      });
    }

    // Replace body with parsed/validated data
    req.body = result.data;
    next();
  };
};
