// ═══════════════════════════════════════════════════════════════════════════
// taskRoutes.js — FINAL COMBINED VERSION
// Base path: /api/tasks
// ═══════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

import {
  generateTasks,
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateStatus,
  completeTask,
  addProofFile,
  addProofCommit,
  getRepoCommits,
} from '../../controllers/Bcontrollers/taskController.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// AI Task Generation
// ─────────────────────────────────────────────────────────────
router.post('/generate', protect, generateTasks);

// ─────────────────────────────────────────────────────────────
// GitHub Repo Commits  ← MOVED UP: must be before /:id
// ─────────────────────────────────────────────────────────────
router.get('/project/:projectId/commits', protect, getRepoCommits);

// ─────────────────────────────────────────────────────────────
// Rebalancing
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
// Basic Task CRUD
// ─────────────────────────────────────────────────────────────
router.post('/', protect, createTask);
router.get('/', protect, listTasks);
router.get('/:id', protect, getTask);
router.patch('/:id', protect, updateTask);
router.patch('/:id/status', protect, updateStatus);

// ─────────────────────────────────────────────────────────────
// Complete Task (Creates BCompletion + Recalculate)
// ─────────────────────────────────────────────────────────────
router.put('/:id/complete', protect, completeTask);

// ─────────────────────────────────────────────────────────────
// Proof Uploads
// ─────────────────────────────────────────────────────────────
router.post('/:id/proofs/files', protect, upload.single('file'), addProofFile);
router.post('/:id/proofs/commits', protect, addProofCommit);

export default router;