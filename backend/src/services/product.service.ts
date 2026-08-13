import prisma from '../lib/prisma';

const createProduct = async (payload: any) => {
  const product = await prisma.product.create({
    data: payload,
  });
  return product;
};

const getAllProducts = async (query: any = {}) => {
  const { search, categoryId, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const whereConditions: any = { isDeleted: false };

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    whereConditions.price = {};
    if (minPrice) whereConditions.price.gte = Number(minPrice);
    if (maxPrice) whereConditions.price.lte = Number(maxPrice);
  }

  const orderBy = { [sortBy]: sortOrder };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: whereConditions,
      skip,
      take: limitNumber,
      orderBy,
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
    }),
    prisma.product.count({ where: whereConditions })
  ]);

  return {
    products,
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    }
  };
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
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
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
