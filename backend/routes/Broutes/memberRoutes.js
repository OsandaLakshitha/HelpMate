import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  verifyAccount,
  addMember,
  listMembers,
  updateMember
} from '../../controllers/Bcontrollers/memberController.js';

const router = Router();

router.get('/verify-account',protect, verifyAccount);
router.post('/:id/members', protect, addMember);
router.get('/:id/members', protect, listMembers);
router.patch('/:id/members/:memberId', protect, updateMember);


export default router;
