import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import {
  // ── EXISTING ──
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateStatus,
  addProofFile,
  addProofCommit,
  getRepoCommits,
  addTaskProof,
  // ── NEW ──
  generateTasks,
  completeTask,
} from '../../controllers/Bcontrollers/taskController.js';

const router = Router();

// ── NEW routes — placed BEFORE /:id so they are not swallowed as params ──────
router.post('/generate',        protect, generateTasks);  // AI task generation
router.put('/:id/complete',     protect, completeTask);   // mark task done

// ── EXISTING routes — unchanged ───────────────────────────────────────────────
router.post('/',                protect, createTask);
router.get('/',                 protect, listTasks);
router.get('/:id',              protect, getTask);
router.patch('/:id',            protect, updateTask);
router.patch('/:id/status',     protect, updateStatus);
router.post('/:id/proofs/files',  protect, upload.single('file'), addProofFile);
router.post('/:id/proofs/commits', protect, addProofCommit);
router.post('/:id/proofs/files',  protect, upload.single('file'), addTaskProof);
router.get('/project/:projectId/commits', protect, getRepoCommits);
// ── NEW: Rebalance routes ─────────────────────────────────────────────────────
router.post('/rebalance/:projectId',          protect, rebalanceTasks);   // one project
router.post('/rebalance-all',                 protect, rebalanceAll);     // all projects


export default router;