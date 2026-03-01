import BPrediction from '../../models/Bmodels/Bprediction.js';
import { recalculate } from '../../services/Bservices/Predictionengine.js';

// ── GET /api/prediction/:projectId ───────────────────────────────────────────
// My prediction for this project — called on MemberSetup and task board
export async function getMyPrediction(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const prediction = await BPrediction.findOne({ studentId, projectId });
    if (!prediction) return res.status(404).json({ success: false, message: 'No prediction yet' });

    return res.status(200).json({ success: true, prediction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/prediction/:projectId/all ───────────────────────────────────────
// All member predictions for a project — shown on project view page
// Only status badge is shown — task details remain private
export async function getAllPredictions(req, res) {
  try {
    const { projectId } = req.params;

    const predictions = await BPrediction.find({ projectId })
      .populate('studentId', 'firstName lastName email avatar');

    return res.status(200).json({ success: true, predictions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/prediction/:projectId/recalc ────────────────────────────────────
// Manual recalculate — for testing
export async function recalcPrediction(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const prediction = await recalculate({ studentId, projectId, triggerType: 'manual' });
    return res.status(200).json({ success: true, prediction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}