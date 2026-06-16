import express from 'express';
import { verifyToken } from '../libs/middleware.js';

import {
  getUser,
  updateUser,
  deleteUser,
  makePremium
} from '../controllers/user.controller.js';

const router = express.Router();

// 🔒 Protected routes
router.get('/:id', verifyToken, getUser);
router.patch('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);

// 💳 Premium upgrade (NO TOKEN REQUIRED)
router.post('/make-premium', makePremium);

export default router;