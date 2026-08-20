import prisma from '../lib/prisma';

const getProductStats = async () => {
  const [
    totalProducts,
    totalCategories,
    averagePrice,
    priceStats,
    productCountByCategory
  ] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.category.count({ where: { isDeleted: false } }),
    prisma.product.aggregate({
      where: { isDeleted: false },
      _avg: { price: true }
    }),
    prisma.product.aggregate({
      where: { isDeleted: false },
      _min: { price: true },
      _max: { price: true }
    }),
    prisma.product.groupBy({
      by: ['categoryId'],
      where: { isDeleted: false },
      _count: {
        id: true
      }
    })
  ]);

  // Get category names for the grouped data
  const categoryIds = productCountByCategory.map(item => item.categoryId);
  const categories = await prisma.category.findMany({
    where: { 
      id: { in: categoryIds },
      isDeleted: false 
    },
    select: { id: true, name: true }
  });

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  const productCountWithNames = productCountByCategory.map(item => ({
    categoryId: item.categoryId,
    categoryName: categoryMap[item.categoryId] || 'Unknown',
    count: item._count.id
  }));

  return {
    totalProducts,
    totalCategories,
    averagePrice: averagePrice._avg.price || 0,
    minPrice: priceStats._min.price || 0,
    maxPrice: priceStats._max.price || 0,
    productCountByCategory: productCountWithNames
  };
};

export const StatsService = { getProductStats };