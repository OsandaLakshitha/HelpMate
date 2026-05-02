// ═══════════════════════════════════════════════════════════════════════════
// memberController.js — v2 (DYNAMIC PREDICTION UPDATE)
//
// Changes from v1:
//
//   addMember:
//     ADDED: Creates initial prediction (recalculate) for new member.
//     WHY: In v1, a member added to a project had no BPrediction record.
//          The prediction API returned 404 for them. They were invisible
//          to the getAllPredictions endpoint (project overview page).
//          Even though they'd have no tasks yet (and the engine will return
//          'not-started'), the record needs to EXIST so the frontend can
//          display them in the team status list.
//
//   updateProjectTime:
//     ADDED: Triggers rebalanceProject() after saving new hours.
//     WHY: Available hours feed into the rebalance service's dailyForThis
//          calculation, which determines task due dates and estimatedDays.
//          In v1, changing hours updated BProjectMember but left all task
//          due dates unchanged — they were based on the OLD hours.
//          rebalanceProject() internally calls recalculate() so prediction
//          also updates.
//
//   All other functions — UNCHANGED
// ═══════════════════════════════════════════════════════════════════════════

import mongoose from 'mongoose';
import BProject from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import User from '../../models/User.js';
import { calcBCP } from '../../services/Bservices/Bcpengine.js';
import { checkWorkload } from '../../services/Bservices/Workloadchecker.js';
import { rebalanceAll, rebalanceProject } from '../../services/Bservices/Rebalanceservice.js';
import { recalculate } from '../../services/Bservices/Predictionengine.js';


// ── verifyAccount — UNCHANGED ─────────────────────────────────────────────────
export async function verifyAccount(req, res) {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email }).lean();
    res.json({
      exists: !!user,
      user: user ? { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email } : null,
    });
  } catch (err) {
    console.error('Verify account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// addMember — v2 (CHANGED)
//
// ADDED: recalculate() after creating the BProjectMember record.
//
// Why the initial prediction matters:
//   1. GET /api/prediction/:projectId/all returns predictions for all members.
//      Without a BPrediction record, the new member is invisible on the
//      project overview page.
//   2. The prediction engine will return 'not-started' (since no tasks exist),
//      but the RECORD needs to exist for:
//      - Frontend team status display
//      - Daily refresh cron to pick them up
//      - Consistent data model (every member has a prediction)
//   3. If the member already has history from other projects (past cold start),
//      the engine can immediately show meaningful context like daysLeft,
//      loadFactor, and activeProjects count.
// ─────────────────────────────────────────────────────────────────────────────
export async function addMember(req, res) {
  try {
    const { id } = req.params;
    const { email, componentName } = req.body;
    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!project.memberIds.some(u => String(u) === String(user._id))) {
      project.memberIds.push(user._id);
      await project.save();
    }
    const existing = await BProjectMember.findOne({ projectId: id, userId: user._id });
    if (existing) return res.status(200).json({ message: 'Member already exists', member: existing });
    const newMember = await BProjectMember.create({
      projectId: id, userId: user._id, email: user.email, componentName: componentName || '',
    });

    // ── NEW: Create initial prediction for the new member ─────────────────────
    // Non-fatal: the member is already saved, prediction is best-effort.
    // Engine will return 'not-started' since there are no tasks yet,
    // but the BPrediction record will exist for frontend display.
    try {
      await recalculate({
        studentId:   user._id,
        projectId:   id,
        triggerType: 'initial',
      });
    } catch (recalcErr) {
      console.warn('Initial prediction for new member failed (non-fatal):', recalcErr.message);
    }

    res.status(201).json({
      message: 'Member added',
      member: { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email, componentName: newMember.componentName },
    });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ── listMembers — UNCHANGED ──────────────────────────────────────────────────
export async function listMembers(req, res) {
  try {
    const members = await BProjectMember.find({ projectId: req.params.id })
      .populate('userId', 'firstName lastName email')
      .lean();
    res.json({ members });
  } catch (err) {
    console.error('List members error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ── updateMember — UNCHANGED ─────────────────────────────────────────────────
export async function updateMember(req, res) {
  try {
    const { id, memberId } = req.params;
    const { componentName } = req.body;
    const pm = await BProjectMember.findOneAndUpdate(
      { projectId: id, userId: new mongoose.Types.ObjectId(memberId) },
      { componentName },
      { new: true }
    ).populate('userId', 'firstName lastName email');
    if (!pm) return res.status(404).json({ message: 'Member not found' });
    res.json({ member: pm });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// ── updateIndividualPart — UNCHANGED ─────────────────────────────────────────
export async function updateIndividualPart(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;
    const { individualPart } = req.body;

    if (!individualPart?.trim()) {
      return res.status(400).json({ success: false, message: 'Individual part description is required' });
    }

    const member = await BProjectMember.findOneAndUpdate(
      { projectId, userId: studentId },
      { $set: { individualPart: individualPart.trim() } },
      { new: true }
    );

    if (!member) return res.status(404).json({ success: false, message: 'You are not a member of this project' });
    return res.status(200).json({ success: true, member });
  } catch (err) {
    console.error('updateIndividualPart error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// updateProjectTime — v2 (CHANGED)
//
// ADDED: rebalanceProject() after saving new available time.
//
// Why rebalance is needed after hours change:
//   The rebalance service uses availableTime to compute dailyForThis:
//     dailyTotal = ((weekdays × 5) + (weekends × 2)) / 7
//     dailyForThis = dailyTotal × (thisWeight / totalWeight)
//
//   This feeds into estimatedDays for every pending task:
//     estimatedDays = ceil(hoursNeeded / dailyForThis)
//
//   And task due dates are spread using dailyForThis:
//     dueDate = today + (cumulativeShare × daysLeft)
//
//   In v1, changing hours updated the BProjectMember record but:
//     ✗ Task due dates stayed based on OLD hours
//     ✗ estimatedDays stayed based on OLD hours
//     ✗ prediction engine used stale estimatedDays
//     → Student reduces weekday hours from 4 to 1, but task due dates
//       still assume 4 hours/day → tasks become impossible to meet
//
//   rebalanceProject() recalculates ALL task due dates with new hours
//   and internally calls recalculate() to update the prediction.
// ─────────────────────────────────────────────────────────────────────────────
export async function updateProjectTime(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;
    const { weekdays, weekends } = req.body;

    const member = await BProjectMember.findOneAndUpdate(
      { projectId, userId: studentId },
      { $set: { 'availableTime.weekdays': Number(weekdays), 'availableTime.weekends': Number(weekends) } },
      { new: true }
    );

    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    // ── NEW: Rebalance this project with new hours ────────────────────────────
    // rebalanceProject() internally calls recalculate(), so we don't need
    // a separate recalculate() call here.
    let rebalanceResult = null;
    try {
      rebalanceResult = await rebalanceProject({ studentId, projectId });
    } catch (rebalanceErr) {
      // Non-fatal: hours are saved even if rebalance fails.
      // The next midnight cron will eventually pick up the new hours.
      console.warn('Rebalance after time update failed (non-fatal):', rebalanceErr.message);

      // Fallback: at least recalculate the prediction even if rebalance failed
      try {
        await recalculate({
          studentId,
          projectId,
          triggerType: 'manual',
        });
      } catch (recalcErr) {
        console.warn('Fallback recalculate also failed:', recalcErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      member,
      rebalanceResult,
    });
  } catch (err) {
    console.error('updateProjectTime error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// ── getBCP — UNCHANGED ───────────────────────────────────────────────────────
export async function getBCP(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const bcp = await calcBCP(studentId);
    return res.status(200).json({ success: true, bcp });
  } catch (err) {
    console.error('getBCP error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// ── getWorkloadCheck — UNCHANGED ─────────────────────────────────────────────
export async function getWorkloadCheck(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const project = await BProject.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const member  = await BProjectMember.findOne({ projectId, userId: studentId });
    const profile = await BStudentProfile.findOne({ userId: studentId });

    const availableTime = member?.availableTime?.weekdays
      ? member.availableTime
      : profile?.availableTime || { weekdays: 2, weekends: 4 };

    const result = await checkWorkload({
      studentId,
      projectId,
      projectDueDate: project.dueDate,
      availableTime,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('getWorkloadCheck error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// ── updatePriority — UNCHANGED (already calls rebalanceAll) ──────────────────
export async function updatePriority(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;
    const { priority, schedulingMode } = req.body;

    const validPriority = ['high', 'medium', 'low'];
    const validMode     = ['linear', 'parallel'];
    if (priority && !validPriority.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority. Use high, medium or low.' });
    }
    if (schedulingMode && !validMode.includes(schedulingMode)) {
      return res.status(400).json({ success: false, message: 'Invalid schedulingMode. Use linear or parallel.' });
    }

    const updates = {};
    if (priority)       updates.priority       = priority;
    if (schedulingMode) updates.schedulingMode = schedulingMode;

    const member = await BProjectMember.findOneAndUpdate(
      { projectId, userId: studentId },
      { $set: updates },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'You are not a member of this project' });
    }

    let rebalanceResults = [];
    try {
      rebalanceResults = await rebalanceAll(studentId);
    } catch (rebalanceErr) {
      console.warn('Rebalance after priority change failed (non-fatal):', rebalanceErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Priority updated and all projects rebalanced',
      member,
      rebalanceResults,
    });
  } catch (err) {
    console.error('updatePriority error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}