import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  closeProject
} from '../../controllers/Bcontrollers/projectController.js';

const router = Router();

// Remove verifyRepo from here since it's in the other file
router.post('/', protect, createProject);
router.get('/', protect, listProjects);

// Parameterized routes LAST
router.get('/:id', protect, getProject);
router.patch('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/close', protect, closeProject);

export default router;