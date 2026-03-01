import mongoose from 'mongoose';
import BProject from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import BStudentProfile from '../../models/Bmodels/BProfile.js';
import User from '../../models/User.js';
import { calcBCP } from '../../services/Bservices/Bcpengine.js';
import { checkWorkload } from '../../services/Bservices/Workloadchecker.js';
import { rebalanceAll } from '../../services/Bservices/Rebalanceservice.js'; // ← NEW import

// ── UNCHANGED ─────────────────────────────────────────────────────────────────

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
    res.status(201).json({
      message: 'Member added',
      member: { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email, componentName: newMember.componentName },
    });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

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
    return res.status(200).json({ success: true, member });
  } catch (err) {
    console.error('updateProjectTime error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

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

// ── NEW: updatePriority ───────────────────────────────────────────────────────
// PUT /api/members/:projectId/priority
// Student sets priority + scheduling mode for this project
// Automatically rebalances ALL active project task dates after saving
export async function updatePriority(req, res) {
  try {
    const studentId = req.user._id || req.user.id;
    const { projectId } = req.params;
    const { priority, schedulingMode } = req.body;

    // Validate
    const validPriority = ['high', 'medium', 'low'];
    const validMode     = ['linear', 'parallel'];
    if (priority && !validPriority.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority. Use high, medium or low.' });
    }
    if (schedulingMode && !validMode.includes(schedulingMode)) {
      return res.status(400).json({ success: false, message: 'Invalid schedulingMode. Use linear or parallel.' });
    }

    // Only update fields that were actually sent
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

    // Auto rebalance ALL projects — shifts task due dates to reflect new allocation
    let rebalanceResults = [];
    try {
      rebalanceResults = await rebalanceAll(studentId);
    } catch (rebalanceErr) {
      // Non-fatal — priority is saved even if rebalance fails
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