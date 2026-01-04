import mongoose from 'mongoose';
import BProject from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import User from '../../models/User.js';

export async function verifyAccount(req, res) {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email }).lean();
    res.json({
      exists: !!user,
      user: user ? { id: user._id, name: user.name, email: user.email } : null
    });
  } catch (err) {
    console.error('Verify account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function addMember(req, res) {
  try {
    const { id } = req.params; // projectId
    const { email, componentName } = req.body;

    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check if already in project
    if (!project.memberIds.some(u => String(u) === String(user._id))) {
      project.memberIds.push(user._id);
      await project.save();
    }

    // Check if already in BProjectMember
    const existing = await BProjectMember.findOne({ projectId: id, userId: user._id });
    if (existing) {
      return res.status(200).json({ message: 'Member already exists', member: existing });
    }

    const newMember = await BProjectMember.create({
      projectId: id,
      userId: user._id,
      email: user.email,
      componentName: componentName || ''
    });

    res.status(201).json({
      message: 'Member added',
      member: { id: user._id, name: user.name, email: user.email, componentName: newMember.componentName }
    });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function listMembers(req, res) {
  try {
    const { id } = req.params;
    const members = await BProjectMember.find({ projectId: id })
      .populate('userId', 'name email')
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
      { projectId: id, userId: mongoose.Types.ObjectId(memberId) },
      { componentName },
      { new: true }
    ).populate('userId', 'name email');

    if (!pm) return res.status(404).json({ message: 'Member not found' });
    res.json({ member: pm });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
