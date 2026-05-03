import BPrediction from '../../models/Bmodels/Bprediction.js';
import BDailyLog   from '../../models/Bmodels/Bdailylog.js';
import BProject    from '../../models/Bmodels/BProject.js';
import { recalculate} from '../../services/Bservices/Predictionengine.js';

// ─────────────────────────────────────────────────────────────────────────────
// getProjectPrediction   GET /api/predictions/:projectId
// Returns the current prediction. Calculates on-the-fly if none exists yet.
// ─────────────────────────────────────────────────────────────────────────────
export async function getProjectPrediction(req, res) {
  try {
    const { projectId } = req.params;
    const studentId     = req.user._id || req.user.id;

    let prediction = await BPrediction.findOne({ studentId, projectId }).lean();

    if (!prediction) {
      prediction = await recalculate({ studentId, projectId, triggerType: 'initial' });
    }

    if (!prediction)
      return res.status(404).json({ message: 'Could not calculate prediction' });

    res.json({ prediction });
  } catch (err) {
    console.error('getProjectPrediction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getAllPredictions   GET /api/predictions
// All active project predictions for the dashboard overview.
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllPredictions(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const now       = new Date();

    const activeProjects = await BProject.find({
      memberIds: studentId,
      status:    'Open',
      dueDate:   { $gt: now },
    }).lean();

    if (activeProjects.length === 0)
      return res.json({ predictions: [] });

    const predictions = await Promise.all(
      activeProjects.map(async (project) => {
        let pred = await BPrediction.findOne({
          studentId, projectId: project._id,
        }).lean();

        if (!pred) {
          pred = await recalculate({
            studentId,
            projectId:   project._id,
            triggerType: 'initial',
          });
        }

        return {
          projectId:    project._id,
          projectTitle: project.title,
          dueDate:      project.dueDate,
          complexity:   project.complexity,
          prediction:   pred,
        };
      })
    );

    res.json({ predictions });
  } catch (err) {
    console.error('getAllPredictions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// refreshPrediction   POST /api/predictions/:projectId/refresh
// Manual trigger — student or frontend requests fresh calculation.
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshPrediction(req, res) {
  try {
    const { projectId } = req.params;
    const studentId     = req.user._id || req.user.id;

    const prediction = await recalculate({
      studentId, projectId, triggerType: 'manual',
    });

    if (!prediction)
      return res.status(500).json({ message: 'Recalculation failed' });

    res.json({ prediction });
  } catch (err) {
    console.error('refreshPrediction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getDailyLogs   GET /api/predictions/:projectId/logs
// Last 14 days of BDailyLog entries — used to render trend charts.
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/predictions/:projectId/logs — Last 14 days of daily logs
export async function getDailyLogs(req, res) {
  try {
    const { projectId } = req.params;
    const studentId = req.user._id || req.user.id;

    const logs = await BDailyLog.find({
      studentId,
      projectId,
    })
      .sort({ date: -1 })
      .limit(14)
      .select('date targetTaskCount completedTaskCount targetMet')
      .lean();

    return res.status(200).json({
      success: true,
      logs: logs.map(log => ({
        date: log.date,
        targetTaskCount: log.targetTaskCount,
        completedTaskCount: log.completedTaskCount,
        targetMet: log.targetMet,
      })),
    });
  } catch (err) {
    console.error('getDailyLogs error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load daily logs' });
  }
}
