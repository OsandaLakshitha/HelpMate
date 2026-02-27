import BInteractionLog from '../../models/Bmodels/BInteractionLog.js';

// Save a new interaction
export async function logInteraction(req, res) {
  try {
    const { projectId, userId, type, durationSec } = req.body;

    const log = await BInteractionLog.create({
      projectId,
      userId,
      type,
      durationSec,
      createdAt: new Date()
    });

    res.json(log);
  } catch (err) {
    console.error('Failed to log interaction:', err);
    res.status(500).json({ error: 'Failed to log interaction' });
  }
}
