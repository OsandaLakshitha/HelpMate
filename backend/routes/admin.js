const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/create-admin', createAdmin);

module.exports = router;