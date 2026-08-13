import prisma from '../lib/prisma';

const createCategory = async (payload: any) => {
  const category = await prisma.category.create({
    data: payload,
  });
  return category;
};

const getAllCategories = async (includeDeleted?: boolean) => {
  const whereCondition = includeDeleted ? {} : { isDeleted: false };

  const categories = await prisma.category.findMany({
    where: whereCondition,
  });
  return categories;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id, isDeleted: false },
  });
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const updateCategory = async (id: string, payload: any) => {
  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return category;
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.update({
    where: { id },
    data: { isDeleted: true },
  });
  return category;
};

const restoreCategory = async (id: string) => {
  const category = await prisma.category.update({
    where: { id },
    data: { isDeleted: false },
  });
  return category;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  restoreCategory,
};