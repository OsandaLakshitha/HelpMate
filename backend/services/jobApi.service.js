const axios = require("axios");

// Fetch jobs from RemoteOK API
async function fetchRemoteOKJobs(skills) {
  try {
    const response = await axios.get("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const jobs = response.data.slice(1, 51);

    return jobs.map((job) => ({
      jobId: job.id || String(Math.random()),
      title: job.position || "Position Available",
      company: job.company || "Company",
      location: job.location || "Remote",
      description: job.description || "No description available",
      salary: {
        min: job.salary_min || null,
        max: job.salary_max || null,
        currency: "LKR" || "USD",
      },
      tags: job.tags || [],
      url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
      source: "RemoteOK",
      postedDate: job.date ? new Date(job.date * 1000) : new Date(),
    }));
  } catch (error) {
    console.error("RemoteOK API Error:", error.message);
    return [];
  }
}

// Fetch jobs from Remotive API
async function fetchRemotiveJobs(skills) {
  try {
    const response = await axios.get("https://remotive.com/api/remote-jobs", {
      params: { limit: 50 },
      timeout: 10000,
    });

    const jobs = response.data.jobs || [];

    return jobs.map((job) => ({
      jobId: String(job.id),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      description: job.description || "No description",
      salary: { min: null, max: null, currency: "LKR" || "USD" },
      tags: job.tags || [job.category || "General"],
      url: job.url,
      source: "Remotive",
      postedDate: new Date(job.publication_date),
    }));
  } catch (error) {
    console.error("Remotive API Error:", error.message);
    return [];
  }
}

// Fallback mock jobs if APIs fail
function getFallbackJobs() {
  return [
    {
      jobId: "fb1",
      title: "Software Developer",
      company: "Tech Company",
      location: "Remote",
      description:
        "We are looking for a talented software developer to join our team...",
      salary: { min: 60000, max: 90000, currency: "USD" },
      tags: ["JavaScript", "React", "Node.js", "MongoDB"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb2",
      title: "Frontend Developer",
      company: "Startup Inc",
      location: "Remote",
      description: "Join our growing team as a frontend developer...",
      salary: { min: 55000, max: 85000, currency: "USD" },
      tags: ["React", "TypeScript", "CSS", "HTML"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb3",
      title: "Business Analyst",
      company: "Consulting Group",
      location: "Hybrid",
      description: "Seeking a business analyst to help drive our projects...",
      salary: { min: 50000, max: 75000, currency: "USD" },
      tags: ["Business Analysis", "Excel", "SQL", "Communication"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb4",
      title: "UI/UX Designer",
      company: "Design Studio",
      location: "Remote",
      description: "Create amazing user experiences for our clients...",
      salary: { min: 50000, max: 80000, currency: "USD" },
      tags: ["Figma", "UI Design", "UX Design", "Prototyping"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb5",
      title: "Project Manager",
      company: "Enterprise Solutions",
      location: "Hybrid",
      description: "Lead cross-functional teams and deliver projects...",
      salary: { min: 65000, max: 95000, currency: "USD" },
      tags: ["Project Management", "Agile", "Leadership", "Communication"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
  ];
}

// Fetch all jobs from multiple sources
async function fetchAllJobs(skills) {
  let allJobs = [];

  // Try RemoteOK
  try {
    const remoteOKJobs = await fetchRemoteOKJobs(skills);
    allJobs.push(...remoteOKJobs);
  } catch (error) {
    console.log("RemoteOK failed");
  }

  // Try Remotive
  try {
    const remotiveJobs = await fetchRemotiveJobs(skills);
    allJobs.push(...remotiveJobs);
  } catch (error) {
    console.log("Remotive failed");
  }

  // Use fallback if no jobs found
  if (allJobs.length === 0) {
    allJobs = getFallbackJobs();
  }

  return allJobs;
}

module.exports = {
  fetchRemoteOKJobs,
  fetchRemotiveJobs,
  getFallbackJobs,
  fetchAllJobs,
};
