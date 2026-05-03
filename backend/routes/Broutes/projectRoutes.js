import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { handleUpload } from '../../middleware/upload.js';  // NEW — multer PDF upload
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  closeProject,
  getProjectStats,
} from '../../controllers/Bcontrollers/projectController.js';

const router = Router();

// handleUpload runs before createProject so req.file is available
router.post('/',           protect, handleUpload, createProject);
router.get('/',            protect, listProjects);
router.get('/:id',         protect, getProject);
router.patch('/:id',       protect, updateProject);
router.delete('/:id',      protect, deleteProject);
router.post('/:id/close',  protect, closeProject);

router.get('/:id/stats', protect, getProjectStats);


export default router;