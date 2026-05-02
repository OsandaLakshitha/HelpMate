import mongoose from "mongoose";

import BInteractionLog from "../../models/Bmodels/BInteractionLog.js";
import BTask from "../../models/Bmodels/BTask.js";
import BDailyLog from "../../models/Bmodels/Bdailylog.js";
import BPrediction from "../../models/Bmodels/Bprediction.js";

import { computeContributionPercent, detectFreeRiders } from "../../utils/performance.js";
import { formatDuration } from "../../utils/time.js";


export const getUserInsights = async (req, res) => {

  try {

    const userId = new mongoose.Types.ObjectId(req.params.userId);

    console.log("📊 Fetching insights for:", userId.toString());



    /*
    ─────────────────────────────────────
    INTERACTION FREQUENCY
    ─────────────────────────────────────
    */

    const interactionFrequency = await BInteractionLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$projectId",
          count: { $sum: 1 }
        }
      }
    ]);



    /*
    ─────────────────────────────────────
    LAST ACTIVE
    ─────────────────────────────────────
    */

    const lastActiveRecord = await BInteractionLog
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    const lastActive = lastActiveRecord
      ? formatDuration(Date.now() - lastActiveRecord.createdAt)
      : null;



    /*
    ─────────────────────────────────────
    ACTION DISTRIBUTION
    ─────────────────────────────────────
    */

    const actions = await BInteractionLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);



    /*
    ─────────────────────────────────────
    TASK STATISTICS
    ─────────────────────────────────────
    */

    const assignedTasks = await BTask.find({ assigneeId: userId });

    const createdTasks = await BTask.find({
      createdBy: userId,
      assigneeId: { $ne: userId }
    });

    const allTasksMap = new Map();

    assignedTasks.forEach(t => allTasksMap.set(t._id.toString(), t));
    createdTasks.forEach(t => allTasksMap.set(t._id.toString(), t));

    const allTasks = Array.from(allTasksMap.values());


    const taskStats = {

      total: allTasks.length,

      assigned: assignedTasks.length,

      created: createdTasks.length,

      completed: allTasks.filter(t => t.status === "Completed").length,

      inProgress: allTasks.filter(t => t.status === "In Progress").length,

      toBeReviewed: allTasks.filter(t => t.status === "To Be Reviewed").length,

      new: allTasks.filter(t => t.status === "New").length

    };



    /*
    ─────────────────────────────────────
    CREATED TASK STATS
    ─────────────────────────────────────
    */

    const createdTasksAll = await BTask.find({ createdBy: userId });

    const createdTasksStats = {

      total: createdTasksAll.length,

      completed: createdTasksAll.filter(t => t.status === "Completed").length,

      inProgress: createdTasksAll.filter(t => t.status === "In Progress").length,

      toBeReviewed: createdTasksAll.filter(t => t.status === "To Be Reviewed").length,

      new: createdTasksAll.filter(t => t.status === "New").length

    };



    /*
    ─────────────────────────────────────
    DAILY LOGS (LAST 14 DAYS)
    ─────────────────────────────────────
    */

    const dailyLogsRaw = await BDailyLog
      .find({ studentId: userId })
      .sort({ date: 1 })
      .limit(14)
      .lean();

    const dailyLogs = dailyLogsRaw.map(log => ({

      date: log.date,

      completed: log.completedTaskCount,

      target: log.targetTaskCount,

      remaining: log.remainingTaskCount,

      trajectoryScore: log.trajectoryScore,

      resilienceScore: log.resilienceScore,

      rapStatus: log.rapStatus

    }));



    /*
    ─────────────────────────────────────
    LATEST PREDICTION
    ─────────────────────────────────────
    */

    const predictionDoc = await BPrediction
      .findOne({ studentId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    const prediction = predictionDoc
      ? {

          trajectoryScore: predictionDoc.trajectoryScore,

          completionScore: predictionDoc.completionScore,

          studentRatio: predictionDoc.studentRatio,

          projectRatio: predictionDoc.projectRatio,

          globalRatio: predictionDoc.globalRatio,

          resilienceScore: predictionDoc.resilienceScore,

          burstFeasibilityPct: predictionDoc.burstFeasibilityPct,

          timeLeftPct: predictionDoc.timeLeftPct,

          dailyTarget: predictionDoc.dailyTarget,

          todayCompletedCount: predictionDoc.todayCompletedCount,

          rapStatus: predictionDoc.rapStatus,

          rapMessage: predictionDoc.rapMessage

        }
      : null;



    /*
    ─────────────────────────────────────
    CONTRIBUTION ANALYSIS
    ─────────────────────────────────────
    */

    const members = createdTasksAll.map(task => ({

      contributionTotal:
        (task.proofFiles?.length || 0) +
        (task.proofCommits?.length || 0),

      activeTimeMinutes: 0

    }));


    let contributions = [];
    let freeRiders = [];

    if (members.length > 0) {

      contributions = computeContributionPercent(members);

      freeRiders = detectFreeRiders(contributions);

    }



    /*
    ─────────────────────────────────────
    FINAL RESPONSE
    ─────────────────────────────────────
    */

    res.json({

      taskStats,

      createdTasks: createdTasksStats,

      interactionFrequency,

      actions,

      lastActive,

      prediction,

      dailyLogs,

      contributions,

      freeRiders

    });


  } catch (error) {

    console.error("❌ Insight controller error:", error);

    res.status(500).json({
      message: "Failed to fetch insights"
    });

  }

};