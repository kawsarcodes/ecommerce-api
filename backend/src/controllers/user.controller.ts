import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const result = await UserService.getAllUsers(includeDeleted);
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const restoreUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.restoreUser(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User restored successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDeletedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.getDeletedUsers();
    res.status(200).json({
      success: true,
      message: 'Deleted users fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  getDeletedUsers,
};