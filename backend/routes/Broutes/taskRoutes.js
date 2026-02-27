import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateStatus,
  addProofFile,
  addProofCommit,
  getRepoCommits,
  addTaskProof
} from '../../controllers/Bcontrollers/taskController.js';

const router = Router();

router.post('/', protect, createTask);
router.get('/', protect, listTasks);
router.get('/:id', protect, getTask);
router.patch('/:id', protect, updateTask);
router.patch('/:id/status', protect, updateStatus);
router.post('/:id/proofs/files', protect, upload.single('file'), addProofFile);
router.post('/:id/proofs/commits', protect, addProofCommit);
router.post('/:id/proofs/files', protect, upload.single('file'), addTaskProof);


// Repo commits for dropdown
router.get('/project/:projectId/commits', protect, getRepoCommits);

export default router;
