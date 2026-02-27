import { useState } from "react";
import { endpoints } from "../../config/api";

export default function ProjectAddForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubRepoUrl: "",
    supervisorEmail: "",
    dueDate: "",
    complexity: "Low",
    projectType: "Research"
  });

  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberMsg, setMemberMsg] = useState("");
  const [repoMsg, setRepoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function verifyAccount() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.projects.verifyAccount(newMemberEmail), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.exists) {
        setMembers([...members, { email: newMemberEmail }]);
        setMemberMsg("✅ Account verified and added");
      } else {
        setMemberMsg("❌ Account not found");
      }
    } catch {
      setMemberMsg("Error verifying account");
    }
  }

  async function verifyRepo() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.projects.verifyRepo, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: formData.githubRepoUrl })
      });
      const data = await res.json();
      if (data.ok) setRepoMsg("✅ Repo verified");
      else setRepoMsg("❌ Repo invalid");
    } catch {
      setRepoMsg("Error verifying repo");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoints.projects.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, members })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create project");

      if (onSuccess) onSuccess(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <h2>Create New Project</h2>

      <label>Title</label>
      <input name="title" value={formData.title} onChange={handleChange} required />

      <label>Description</label>
      <textarea name="description" value={formData.description} onChange={handleChange} />

      <label>GitHub Repo URL</label>
      <input name="githubRepoUrl" value={formData.githubRepoUrl} onChange={handleChange} />
      <button type="button" onClick={verifyRepo}>Verify Repo</button>
      {repoMsg && <p>{repoMsg}</p>}

      <label>Supervisor Email (optional)</label>
      <input type="email" name="supervisorEmail" value={formData.supervisorEmail} onChange={handleChange} />

      <label>Due Date</label>
      <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />

      <label>Complexity</label>
      <select name="complexity" value={formData.complexity} onChange={handleChange}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <label>Project Type</label>
      <select name="projectType" value={formData.projectType} onChange={handleChange}>
        <option>Research</option>
        <option>Coursework</option>
        <option>Personal</option>
        <option>Other</option>
      </select>

      <h3>Add Members</h3>
      <input
        type="email"
        placeholder="Member email"
        value={newMemberEmail}
        onChange={(e) => setNewMemberEmail(e.target.value)}
      />
      <button type="button" onClick={verifyAccount}>Verify & Add</button>
      {memberMsg && <p>{memberMsg}</p>}
      <ul>
        {members.map((m, i) => <li key={i}>{m.email}</li>)}
      </ul>

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
