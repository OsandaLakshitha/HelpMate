import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  // ── EXISTING ──
  verifyAccount,
  addMember,
  listMembers,
  updateMember,
  // ── NEW ──
  updateIndividualPart,
  updateProjectTime,
  getBCP,
  getWorkloadCheck,
} from '../../controllers/Bcontrollers/memberController.js';

const router = Router();

// ── EXISTING routes — unchanged ───────────────────────────────────────────────
router.get('/verify-account',            protect, verifyAccount);
router.post('/:id/members',              protect, addMember);
router.get('/:id/members',               protect, listMembers);
router.patch('/:id/members/:memberId',   protect, updateMember);

// ── NEW routes ─────────────────────────────────────────────────────────────────
router.put('/:projectId/part',           protect, updateIndividualPart);   // save individual part
router.put('/:projectId/time',           protect, updateProjectTime);      // save study hours
router.get('/:projectId/bcp',            protect, getBCP);                 // get BCP ratios
router.get('/:projectId/workload',       protect, getWorkloadCheck);       // workload check
router.put('/:projectId/priority',         protect, updatePriority);

export default router;