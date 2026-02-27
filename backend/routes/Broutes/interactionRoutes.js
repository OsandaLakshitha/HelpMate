import express from 'express';
import { logInteraction } from '../../controllers/Bcontrollers/interactionController.js';

const router = express.Router();

// POST /api/interactions
router.post('/', logInteraction);

export default router;
