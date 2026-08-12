import prisma from '../lib/prisma';

const createProduct = async (payload: any) => {
  const product = await prisma.product.create({
    data: payload,
  });
  return product;
};

const getAllProducts = async () => {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });
  return products;
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      reviews: true,
    }
  });
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const updateProduct = async (id: string, payload: any) => {
  const product = await prisma.product.update({
    where: { id },
    data: payload,
  });
  return product;
};

const deleteProduct = async (id: string) => {
  const product = await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
  return product;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
