import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('ADMIN'), UserController.createUser);
router.get('/', authenticate, authorizeRoles('ADMIN'), UserController.getAllUsers);
router.get('/deleted', authenticate, authorizeRoles('ADMIN'), UserController.getDeletedUsers);
router.get('/:id', authenticate, authorizeRoles('ADMIN'), UserController.getUserById);
router.patch('/:id', authenticate, authorizeRoles('ADMIN'), UserController.updateUser);
router.patch('/:id/restore', authenticate, authorizeRoles('ADMIN'), UserController.restoreUser);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), UserController.deleteUser);

export default router;