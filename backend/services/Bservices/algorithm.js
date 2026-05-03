// ═══════════════════════════════════════════════════════════════════════════
// predictionEngine.js — v5 (ABSRM)
// Adaptive Behavioural Stability & Recovery Model
// ═══════════════════════════════════════════════════════════════════════════

import BTask from '../../models/Bmodels/BTask.js';
import BProject from '../../models/Bmodels/BProject.js';
import BPrediction from '../../models/Bmodels/Bprediction.js';
import BCompletion from '../../models/Bmodels/Bcompletion.js';
import BDailyLog from '../../models/Bmodels/Bdailylog.js';

const r2 = v => Math.round(v * 100) / 100;

export const recalculate = async ({
  studentId,
  projectId,
  triggerType = 'initial',
  triggeredByTaskId = null,
}) => {
  try {

    const project = await BProject.findById(projectId);
    if (!project) throw new Error('Project not found');

    const now = new Date();
    const dueDate = new Date(project.dueDate);
    const daysLeft = Math.max(0.1, (dueDate - now) / 86400000);

    const allTasks = await BTask.find({ projectId, assigneeId: studentId });
    const pendingTasks = allTasks.filter(t => t.status !== 'Completed');
    const doneTasks = allTasks.filter(t => t.status === 'Completed');

    // ─────────────────────────────────────────────────────────
    // HARD OVERRIDES
    // ─────────────────────────────────────────────────────────

    if (allTasks.length === 0) {
      return upsert(studentId, projectId, {
        status: 'not-started',
        lastTriggerType: triggerType,
        lastTriggerDate: now,
      });
    }

    if (pendingTasks.length === 0) {
      return upsert(studentId, projectId, {
        status: 'complete',
        lastTriggerType: triggerType,
        lastTriggerDate: now,
      });
    }

    if (daysLeft <= 0) {
      return upsert(studentId, projectId, {
        status: 'in-danger',
        trajectoryScore: 0,
        lastTriggerType: triggerType,
        lastTriggerDate: now,
      });
    }

    // ─────────────────────────────────────────────────────────
    // COLD START GATE
    // ─────────────────────────────────────────────────────────

    const totalCompletions = await BCompletion.countDocuments({
      studentId,
      countForColdStart: true,
    });

    if (totalCompletions < 4) {
      return upsert(studentId, projectId, {
        status: 'not-started',
        coldStart: true,
        completionsNeeded: 4 - totalCompletions,
        confidence: 0,
        daysLeft: Math.round(daysLeft),
      });
    }

    // ─────────────────────────────────────────────────────────
    // NEW PROJECT GATE
    // ─────────────────────────────────────────────────────────

    if (doneTasks.length === 0) {
      return upsert(studentId, projectId, {
        status: 'not-started',
        newProjectPending: true,
        confidence: 0,
        daysLeft: Math.round(daysLeft),
      });
    }

    // ─────────────────────────────────────────────────────────
    // MULTI PROJECT LOAD
    // ─────────────────────────────────────────────────────────

    const activeProjects = await BProject.find({
      memberIds: studentId,
      status: 'Open',
      dueDate: { $gt: now },
    }).lean();

    const activeCount = activeProjects.length;

    const loadFactor =
      activeCount <= 1 ? 1 :
      activeCount === 2 ? 0.85 :
      activeCount === 3 ? 0.7 :
      0.6;

    const requiredRate = pendingTasks.length / daysLeft;
    const adjustedRate = requiredRate * loadFactor;
    const dailyTarget = Math.max(1, Math.ceil(adjustedRate));

    // ─────────────────────────────────────────────────────────
    // STUDENT RATIO (Weighted Rolling)
    // ─────────────────────────────────────────────────────────

    const WEIGHTS = [1.0,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1];

    const logs = await BDailyLog.find({
      studentId,
      targetTaskCount: { $gt: 0 },
    }).sort({ date: -1 }).limit(10).lean();

    const calcWeightedRatio = (records) => {
      let sum = 0, weightSum = 0;
      records.forEach((r,i) => {
        const w = WEIGHTS[i] || 0.1;
        const ratio = r.completedTaskCount / r.targetTaskCount;
        sum += ratio * w;
        weightSum += w;
      });
      return weightSum > 0 ? Math.max(0.05, sum/weightSum) : 1;
    };

    const studentRatio = calcWeightedRatio(logs);

    // ─────────────────────────────────────────────────────────
    // STABILITY (Volatility Control)
    // ─────────────────────────────────────────────────────────

    const ratios = logs.map(l => l.completedTaskCount / l.targetTaskCount);
    const mean = ratios.reduce((a,b)=>a+b,0)/(ratios.length||1);
    const variance = ratios.reduce((a,b)=>a+(b-mean)**2,0)/(ratios.length||1);
    const stdDev = Math.sqrt(variance);

    const stability = Math.max(0.3, 1 - stdDev);

    // ─────────────────────────────────────────────────────────
    // ACCELERATION (Trend Detection)
    // ─────────────────────────────────────────────────────────

    let acceleration = 1;
    if (ratios.length >= 3) {
      const first = ratios[ratios.length-1];
      const last = ratios[0];
      const slope = last - first;
      acceleration = Math.max(0.5, Math.min(1.5, 1 + slope));
    }

    // ─────────────────────────────────────────────────────────
    // MULTI PROJECT PRESSURE INDEX (MPI)
    // ─────────────────────────────────────────────────────────

    const totalRequired = activeProjects.reduce((sum,p)=>{
      const dl = Math.max(0.1,(new Date(p.dueDate)-now)/86400000);
      const tasks = 5; // safe assumption baseline
      return sum + (tasks/dl);
    },0);

    const realisticCapacity = 2; // max tasks per day realistic
    const MPI = totalRequired / realisticCapacity;

    // ─────────────────────────────────────────────────────────
    // CORE BEHAVIOURAL SCORE (CBS)
    // ─────────────────────────────────────────────────────────

    const CBS = studentRatio * (0.6 + 0.2*stability + 0.2*acceleration);
    const adjustedCBS = MPI > 1 ? CBS / MPI : CBS;

    const TS = adjustedCBS * 100;

    // ─────────────────────────────────────────────────────────
    // LONG TERM STATUS
    // ─────────────────────────────────────────────────────────

    let longTermStatus =
      TS >= 100 ? 'on-track' :
      TS >= 70 ? 'at-risk' :
      'in-danger';

    // ─────────────────────────────────────────────────────────
    // DAILY BEHAVIOUR
    // ─────────────────────────────────────────────────────────

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayCompletedCount = await BCompletion.countDocuments({
      studentId,
      projectId,
      createdAt: { $gte: todayStart },
      countForColdStart: true
    });

    const dailyRate = todayCompletedCount / dailyTarget;

    let dailyStatus =
      dailyRate >= 1 ? 'on-track' :
      dailyRate >= 0.5 ? 'at-risk' :
      'in-danger';

    // ─────────────────────────────────────────────────────────
    // HYBRID STATUS
    // ─────────────────────────────────────────────────────────

    let status;
    if (dailyRate >= 0.9 && TS >= 100) status = 'on-track';
    else if (dailyRate >= 0.5 || TS >= 70) status = 'at-risk';
    else status = 'in-danger';

    // ─────────────────────────────────────────────────────────
    // RECOVERY FEASIBILITY
    // ─────────────────────────────────────────────────────────

    const maxObserved = Math.max(...ratios,1);
    const sustainableMax = maxObserved * stability;
    const bestCaseDays = pendingTasks.length / sustainableMax;
    const recoveryScore = daysLeft / bestCaseDays;

    const recoveryStatus =
      recoveryScore >= 1 ? 'strong' :
      recoveryScore >= 0.7 ? 'possible' :
      'unlikely';

    // ─────────────────────────────────────────────────────────
    // CONFIDENCE
    // ─────────────────────────────────────────────────────────

    const confidence = Math.min(0.95, 0.3 + logs.length*0.05);

    // ─────────────────────────────────────────────────────────
    // SAVE DAILY LOG
    // ─────────────────────────────────────────────────────────

    const dateKey = now.toISOString().split('T')[0];

    await BDailyLog.findOneAndUpdate(
      { studentId, projectId, date: dateKey },
      {
        $set: {
          targetTaskCount: dailyTarget,
          completedTaskCount: todayCompletedCount,
          dailyRatio: r2(dailyRate),
          remainingTaskCount: pendingTasks.length,
          trajectoryScore: r2(TS),
          studentRatio: r2(studentRatio),
          stability: r2(stability),
          acceleration: r2(acceleration),
          mpi: r2(MPI),
          recoveryScore: r2(recoveryScore),
          status,
          confidence: r2(confidence),
        }
      },
      { upsert: true, new: true }
    );

    // ─────────────────────────────────────────────────────────
    // SAVE PREDICTION
    // ─────────────────────────────────────────────────────────

    return upsert(studentId, projectId, {
      status,
      trajectoryScore: r2(TS),
      studentRatio: r2(studentRatio),
      stability: r2(stability),
      acceleration: r2(acceleration),
      mpi: r2(MPI),
      recoveryScore: r2(recoveryScore),
      recoveryStatus,
      dailyTarget,
      todayCompletedCount,
      dailyRate: r2(dailyRate),
      projectedDaysNeeded: r2(pendingTasks.length / studentRatio),
      daysLeft: Math.round(daysLeft),
      confidence: r2(confidence),
      lastTriggerType: triggerType,
      lastTriggerDate: now,
      triggeredByTaskId: triggeredByTaskId || null,
    });

  } catch (err) {
    console.error('predictionEngine v5 error:', err.message);
    return null;
  }
};

const upsert = (studentId, projectId, data) =>
  BPrediction.findOneAndUpdate(
    { studentId, projectId },
    { $set: data },
    { upsert: true, new: true }
  );