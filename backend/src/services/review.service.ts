import prisma from '../lib/prisma';

const createReview = async (payload: any) => {
  const review = await prisma.review.create({
    data: payload,
  });
  return review;
};

const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    where: { isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        }
      },
      product: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });
  return reviews;
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        }
      },
      product: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });
  if (!review) {
    throw new Error('Review not found');
  }
  return review;
};

const updateReview = async (id: string, payload: any) => {
  const review = await prisma.review.update({
    where: { id },
    data: payload,
  });
  return review;
};

const deleteReview = async (id: string) => {
  const review = await prisma.review.update({
    where: { id },
    data: { isDeleted: true },
  });
  return review;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
