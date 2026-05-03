import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { 
  verifyRepo, 
  getProjectCommits 
} from '../../controllers/Bcontrollers/projectController.js';
import { 
  getRepoCommits, 
  addProofCommit 
} from '../../controllers/Bcontrollers/taskController.js';

const router = Router();

// --- PROJECT LEVEL ROUTES ---

// ✅ Correct: Specific string 'verify-repo' comes before :id
router.get('/verify-repo', protect, verifyRepo);

// ✅ Correct: Fetches all available commits for a project (for the dropdown)
router.get('/:projectId/commits', protect, getRepoCommits);


// --- TASK LEVEL ROUTES (Proof of Work) ---

// ✅ Correct: Adds a specific SHA from the dropdown to a specific Task
// This route should match the task ID, not the project ID
router.post('/tasks/:id/proof-commit', protect, addProofCommit);

export default router;