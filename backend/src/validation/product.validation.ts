import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().optional(),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  categoryId: z.string().uuid({ message: 'Invalid category ID' }),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }).optional(),
  description: z.string().optional(),
  price: z.number().positive({ message: 'Price must be a positive number' }).optional(),
  categoryId: z.string().uuid({ message: 'Invalid category ID' }).optional(),
});
