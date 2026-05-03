import fetch from 'node-fetch';

export function parseRepo(url) {
  try {
    // Remove .git extension if present
    const cleanUrl = url.replace(/\.git$/, '');
    const u = new URL(cleanUrl);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    // Remove .git from repo name if still present
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

export async function verifyRepoExists(url, token = process.env.GITHUB_TOKEN) {
  const parsed = parseRepo(url);
  if (!parsed) return { ok: false, status: 400, message: 'Invalid GitHub repo URL' };
  const api = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  
  // Add User-Agent header (required by GitHub API)
  const headers = { 'User-Agent': 'HelpMate-App' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(api, { headers });
  return { ok: res.status === 200, status: res.status };
}

export async function fetchCommits(url, token = process.env.GITHUB_TOKEN) {
  const parsed = parseRepo(url);
  if (!parsed) throw new Error('Invalid GitHub repo URL');
  const api = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?sha=main&per_page=100`;
  
  // Add User-Agent header (required by GitHub API)
  const headers = { 'User-Agent': 'HelpMate-App' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(api, { headers });
  if (!res.ok) throw new Error(`GitHub commits fetch failed: ${res.status}`);
  const data = await res.json();
  return data.map(c => ({
    sha: c.sha,
    message: c.commit?.message || '',
    authorName: c.commit?.author?.name || c.author?.login || 'Unknown',
    authoredAt: c.commit?.author?.date ? new Date(c.commit.author.date) : null
  }));
}
// 1. Fetch Commits for Dropdown (with branch detection)
export async function getRepoCommits(req, res) {
  try {
    const { projectId } = req.params;
    const { branch } = req.query; // Optional: ?branch=feature-name

    const project = await BProject.findById(projectId);
    if (!project?.githubRepoUrl) return res.status(404).json({ message: 'Repo URL not found' });

    const parsed = parseRepo(project.githubRepoUrl);
    const token = process.env.GITHUB_TOKEN;

    // Determine target branch (passed branch OR default_branch from GitHub)
    let targetBranch = branch;
    if (!targetBranch) {
      const repoData = await getRepoInfo(parsed.owner, parsed.repo, token);
      targetBranch = repoData.default_branch;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits`, 
      {
        params: { sha: targetBranch, per_page: 30 },
        headers: { Authorization: `token ${token}` }
      }
    );

    const commits = response.data.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author.name,
      authoredAt: c.commit.author.date,
      avatar: c.author?.avatar_url
    }));

    res.json({ branch: targetBranch, commits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 2. Add Selected Commit as Proof to DB
export async function addProofCommit(req, res) {
  try {
    const { id } = req.params;
    const { sha } = req.body; // SHA sent from frontend selection

    const task = await BTask.findById(id).populate('projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const parsed = parseRepo(task.projectId.githubRepoUrl);

    // Verify SHA exists on GitHub before saving
    const response = await axios.get(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits/${sha}`,
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );

    const c = response.data;

    // Check for duplicates
    const isDuplicate = task.proofCommits.some(item => item.sha === sha);
    if (isDuplicate) return res.status(400).json({ message: 'Commit already added' });

    // Push to Schema
    task.proofCommits.push({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author.name,
      authoredAt: new Date(c.commit.author.date)
    });

    await task.save();
    res.status(201).json({ message: 'Commit linked successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'GitHub Verification Failed' });
  }
}