import BProject from '../../models/Bmodels/BProject.js';
import BProjectMember from '../../models/Bmodels/BProjectMember.js';
import { verifyRepoExists, fetchCommits } from '../../utils/github.js';

export async function createProject(req, res) {
  try {
    const { 
      title, 
      description, 
      githubRepoUrl, 
      supervisorEmail, 
      dueDate, 
      complexity, 
      projectType,
      members,
      memberIds
    } = req.body;

    // Ensure authenticated user is present
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // Validate required fields
    if (!title || !dueDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and due date are required' 
      });
    }

    // Validate that creator has specified their component
    const creatorMember = members?.find(m => m.userId === req.user.id);
    if (!creatorMember || !creatorMember.componentName) {
      return res.status(400).json({ 
        success: false,
        message: 'Please specify your component/role in the project' 
      });
    }

    console.log('Creating project with members:', members);
    console.log('Member IDs:', memberIds);

    let githubVerified = false;
    if (githubRepoUrl) {
      const v = await verifyRepoExists(githubRepoUrl);
      githubVerified = v.ok;
    }

    const project = await BProject.create({
      title, 
      description, 
      githubRepoUrl, 
      githubVerified,
      creatorId: req.user.id,
      supervisorEmail,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      complexity, 
      projectType,
      memberIds: memberIds || [req.user.id],
      status: 'Open'
    });

    // Create project member entries for all members (including creator)
    if (members && members.length > 0) {
      const memberPromises = members.map(member => 
        BProjectMember.create({
          projectId: project._id,
          userId: member.userId,
          email: member.email,
          componentName: member.componentName || '',
          contributionTotal: 0,
          activeTimeMinutes: 0
        })
      );
      await Promise.all(memberPromises);
    }

    console.log('✅ Project created successfully with', memberIds?.length || 1, 'members');

    res.status(201).json({ 
      success: true,
      message: 'Project created successfully',
      project 
    });
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create project',
      error: error.message 
    });
  }
}

export async function listProjects(req, res) {
  try {
    const { mine, search } = req.query;
    const filter = mine === 'true' ? { creatorId: req.user.id } : { memberIds: req.user.id };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const projects = await BProject.find(filter).sort({ updatedAt: -1 }).lean();
    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

export async function getProject(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = await BProjectMember.find({ projectId: id })
      .populate('userId', 'firstName lastName email')
      .lean();

    res.json({ project, members });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.githubRepoUrl) {
      const v = await verifyRepoExists(updates.githubRepoUrl);
      updates.githubVerified = v.ok;
    }

    const project = await BProject.findByIdAndUpdate(id, updates, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (String(project.creatorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only creator can delete' });
    }
    await BProjectMember.deleteMany({ projectId: id });
    const { default: BTask } = await import('../../models/Bmodels/BTask.js');
    await BTask.deleteMany({ projectId: id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
}

export async function closeProject(req, res) {
  try {
    const { id } = req.params;
    const project = await BProject.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.status = 'Closed';
    await project.save();
    res.json({ project });
  } catch (error) {
    console.error('Close project error:', error);
    res.status(500).json({ message: 'Failed to close project' });
  }
}

export async function verifyRepo(req, res) {
  try {
    const { repoUrl } = req.query;
    
    console.log('🔍 Verifying repo request:', repoUrl);

    if (!repoUrl) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Missing repoUrl parameter' 
      });
    }

    const result = await verifyRepoExists(repoUrl);
    
    console.log('Verification result:', result);

    if (!result.ok) {
      let message = 'Repository not found. Please check the URL.';
      
      if (result.status === 400) {
        message = result.message || 'Invalid GitHub repository URL';
      } else if (result.status === 404) {
        message = 'Repository not found or is private. Please check the URL or make sure the repository is public.';
      } else if (result.status === 403) {
        message = 'GitHub API rate limit exceeded. Please try again in a few minutes.';
      }

      return res.status(200).json({ 
        valid: false, 
        message 
      });
    }

    res.status(200).json({ 
      valid: true, 
      message: 'Repository verified successfully'
    });
  } catch (err) {
    console.error('❌ verifyRepo error:', err);
    res.status(500).json({ 
      valid: false, 
      message: 'Error verifying repository',
      error: err.message 
    });
  }
}

export async function getProjectCommits(req, res) {
  try {
    const { id } = req.params;
    
    console.log('📊 Fetching commits for project:', id);

    const project = await BProject.findById(id);
    
    if (!project) {
      return res.status(404).json({ 
        message: 'Project not found' 
      });
    }

    if (!project.githubRepoUrl) {
      return res.status(404).json({ 
        message: 'No GitHub repository linked to this project' 
      });
    }

    const commits = await fetchCommits(project.githubRepoUrl);
    
    res.status(200).json({ 
      success: true,
      commits 
    });
  } catch (err) {
    console.error('❌ getProjectCommits error:', err);
    res.status(500).json({ 
      message: 'Error fetching commits',
      error: err.message 
    });
  }
}