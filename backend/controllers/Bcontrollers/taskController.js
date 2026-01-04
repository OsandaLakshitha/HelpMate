import axios from 'axios';
import BTask from '../../models/Bmodels/BTask.js';
import BProject from '../../models/Bmodels/BProject.js';

// Create a new task
export async function createTask(req, res) {
  try {
    const { projectId, name, description, assigneeId, dueDate, taskType, complexity, status } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ message: 'Project ID and name are required' });
    }

    const project = await BProject.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await BTask.create({
      projectId,
      name,
      description,
      assigneeId,
      assignedById: req.user.id,
      status: status || 'New',
      taskType,
      complexity,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    // Populate and return
    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();

    res.status(201).json({ task: populatedTask });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// List tasks (by project or assignee)
export async function listTasks(req, res) {
  try {
    const { projectId } = req.query;
    let filter = {};
    
    if (projectId) {
      filter.projectId = projectId;
    } else {
      filter.assigneeId = req.user.id;
    }

    const tasks = await BTask.find(filter)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .lean();
      
    res.json({ tasks });
  } catch (err) {
    console.error('List tasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get single task
export async function getTask(req, res) {
  try {
    const { id } = req.params;
    
    const task = await BTask.findById(id)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
      
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    res.json({ task });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update task (general fields)
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await BTask.findByIdAndUpdate(id, updates, { new: true })
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
      
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json({ task: updatedTask });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update status with lifecycle timestamps
export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updates = { status };
    const now = new Date();

    if (status === 'In Progress') updates.startedAt = now;
    if (status === 'To Be Reviewed') updates.progressAt = now;
    if (status === 'Completed') updates.completedAt = now;

    const task = await BTask.findByIdAndUpdate(id, updates, { new: true })
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
      
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ task });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Add proof commit (using project repo + commit SHA)
export async function addProofCommit(req, res) {
  try {
    const { id } = req.params;
    const { sha } = req.body;

    const task = await BTask.findById(id).populate('projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const repoUrl = task.projectId.githubRepoUrl;
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ message: 'Invalid repo URL' });

    const [ , owner, repo ] = match;

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    });

    const commitData = response.data;

    task.proofCommits.push({
      sha: commitData.sha,
      message: commitData.commit.message,
      authorName: commitData.commit.author.name,
      authoredAt: new Date(commitData.commit.author.date)
    });

    await task.save();
    
    // Populate before returning
    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    
    res.status(201).json({ message: 'Proof commit added', task: populatedTask });
  } catch (err) {
    console.error('Add proof commit error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to add proof commit' });
  }
}

// Add proof file
export async function addProofFile(req, res) {
  try {
    const { id } = req.params;
    const fileUrl = req.file?.path;

    if (!fileUrl) return res.status(400).json({ message: 'No file uploaded' });

    const task = await BTask.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.proofFiles.push({
      url: fileUrl,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await task.save();
    
    // Populate before returning
    const populatedTask = await BTask.findById(task._id)
      .populate('assigneeId', 'firstName lastName email')
      .populate('assignedById', 'firstName lastName email')
      .lean();
    
    res.status(201).json({ message: 'Proof file added', task: populatedTask });
  } catch (err) {
    console.error('Add proof file error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Fetch repo commits (for dropdown)
export async function getRepoCommits(req, res) {
  try {
    const { projectId } = req.params;
    const project = await BProject.findById(projectId);

    if (!project || !project.githubRepoUrl) {
      return res.status(404).json({ message: 'Project or repo not found' });
    }

    // regex handles: https://github.com/owner/repo OR https://github.com/owner/repo.git
    const match = project.githubRepoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) return res.status(400).json({ message: 'Invalid repo URL' });

    const [, owner, repo] = match;

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      params: { per_page: 50 }, // Removed sha: 'main' to auto-detect default branch
      headers: { 
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const commits = response.data.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author.name,
      authoredAt: c.commit.author.date,
      html_url: c.html_url // Added this so you can link to the code later
    }));

    res.json({ commits });
  } catch (err) {
    // Better error logging for debugging API rate limits or token issues
    console.error('GitHub API Error:', err.response?.status, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({ 
      message: err.response?.data?.message || 'Failed to fetch commit history' 
    });
  }
}
export const addTaskProof = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const taskId = req.params.id;
        
        // IMPORTANT: Save ONLY "uploads/filename" 
        // DO NOT save req.file.path (which contains D:\binu1...)
        const fileUrl = `uploads/${req.file.filename}`;

        const task = await task.findByIdAndUpdate(
            taskId,
            { 
                $push: { 
                    proofFiles: { 
                        url: fileUrl, 
                        type: req.file.mimetype,
                        uploadedAt: new Date()
                    } 
                } 
            },
            { new: true }
        );

        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};