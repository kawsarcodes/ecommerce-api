import prisma from '../lib/prisma';

const createUser = async (payload: any) => {
  const user = await prisma.user.create({
    data: payload,
  });
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const getAllUsers = async (includeDeleted?: boolean) => {
  const whereCondition = includeDeleted ? {} : { isDeleted: false };

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return users;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const updateUser = async (id: string, payload: any) => {
  const user = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isDeleted: true,
    }
  });
  return user;
};

const restoreUser = async (id: string) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isDeleted: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
};

const getDeletedUsers = async () => {
  const users = await prisma.user.findMany({
    where: { isDeleted: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return users;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  getDeletedUsers,
};