const axios = require("axios");

// Fetch jobs from RemoteOK API
async function fetchRemoteOKJobs(skills) {
  try {
    const response = await axios.get("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const jobs = response.data.slice(1, 100); // Get more jobs for better filtering
    const skillsLower = skills.map((s) => s.toLowerCase().trim());

    // Filter jobs that match at least one user skill
    const relevantJobs = jobs
      .filter((job) => {
        const jobText = `${job.position} ${job.description} ${(
          job.tags || []
        ).join(" ")}`.toLowerCase();
        return skillsLower.some((skill) => jobText.includes(skill));
      })
      .slice(0, 40); // Take top 40 relevant jobs

    return relevantJobs.map((job) => ({
      jobId: job.id || String(Math.random()),
      title: job.position || "Position Available",
      company: job.company || "Company",
      location: job.location || "Remote",
      description: job.description || "No description available",
      salary: {
        min: job.salary_min || null,
        max: job.salary_max || null,
        currency: "USD",
      },
      tags: job.tags || [],
      url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
      source: "RemoteOK",
      postedDate:
        job.date && !isNaN(job.date) ? new Date(job.date * 1000) : new Date(),
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
      params: { limit: 100 },
      timeout: 10000,
    });

    const jobs = response.data.jobs || [];
    const skillsLower = skills.map((s) => s.toLowerCase().trim());

    // Filter jobs that match at least one user skill
    const relevantJobs = jobs
      .filter((job) => {
        const jobText =
          `${job.title} ${job.description} ${job.category}`.toLowerCase();
        return skillsLower.some((skill) => jobText.includes(skill));
      })
      .slice(0, 40); // Take top 40 relevant jobs

    return relevantJobs.map((job) => ({
      jobId: String(job.id),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      description: job.description || "No description",
      salary: { min: null, max: null, currency: "USD" },
      tags: job.tags || [job.category || "General"],
      url: job.url,
      source: "Remotive",
      postedDate:
        job.publication_date && !isNaN(new Date(job.publication_date).getTime())
          ? new Date(job.publication_date)
          : new Date(),
    }));
  } catch (error) {
    console.error("Remotive API Error:", error.message);
    return [];
  }
}

// Fallback mock jobs if APIs fail - skill-based
function getFallbackJobs(skills = []) {
  const skillsLower = skills.map((s) => s.toLowerCase().trim());

  const allFallbackJobs = [
    // Tech Jobs
    {
      jobId: "fb1",
      title: "Full Stack Developer",
      company: "Tech Solutions Inc",
      location: "Remote",
      description:
        "Looking for an experienced developer with JavaScript, React, Node.js, and MongoDB skills. Build scalable web applications and APIs.",
      salary: { min: 60000, max: 90000, currency: "USD" },
      tags: [
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB",
        "Express",
        "REST API",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb2",
      title: "Frontend Developer",
      company: "Digital Startup",
      location: "Remote",
      description:
        "Join our team to build modern user interfaces with React, TypeScript, and responsive design principles.",
      salary: { min: 55000, max: 85000, currency: "USD" },
      tags: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "UI/UX"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb3",
      title: "Backend Developer",
      company: "Cloud Services Ltd",
      location: "Remote",
      description:
        "Develop server-side applications using Node.js, Python, or Java. Work with databases and API development.",
      salary: { min: 65000, max: 95000, currency: "USD" },
      tags: [
        "Node.js",
        "Python",
        "Java",
        "SQL",
        "MongoDB",
        "REST API",
        "Docker",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb4",
      title: "Software Engineer",
      company: "Enterprise Tech",
      location: "Hybrid",
      description:
        "Work on enterprise applications using modern tech stack. Strong programming skills required.",
      salary: { min: 70000, max: 100000, currency: "USD" },
      tags: ["JavaScript", "Python", "Java", "Git", "Agile", "Problem Solving"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    // Business Jobs
    {
      jobId: "fb5",
      title: "Business Analyst",
      company: "Consulting Group",
      location: "Hybrid",
      description:
        "Analyze business processes, gather requirements, and create documentation. Work with stakeholders and technical teams.",
      salary: { min: 50000, max: 75000, currency: "USD" },
      tags: [
        "Business Analysis",
        "Excel",
        "SQL",
        "Communication",
        "Requirements",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb6",
      title: "Project Manager",
      company: "Enterprise Solutions",
      location: "Hybrid",
      description:
        "Lead cross-functional teams, manage project timelines, and deliver results using Agile methodologies.",
      salary: { min: 65000, max: 95000, currency: "USD" },
      tags: [
        "Project Management",
        "Agile",
        "Leadership",
        "Communication",
        "Scrum",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    // Design Jobs
    {
      jobId: "fb7",
      title: "UI/UX Designer",
      company: "Design Studio",
      location: "Remote",
      description:
        "Create beautiful user experiences using Figma, conduct user research, and collaborate with developers.",
      salary: { min: 50000, max: 80000, currency: "USD" },
      tags: ["Figma", "UI Design", "UX Design", "Prototyping", "User Research"],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    {
      jobId: "fb8",
      title: "Graphic Designer",
      company: "Creative Agency",
      location: "Remote",
      description:
        "Design marketing materials, branding assets, and digital content using Adobe Creative Suite.",
      salary: { min: 45000, max: 70000, currency: "USD" },
      tags: [
        "Photoshop",
        "Illustrator",
        "Graphic Design",
        "Branding",
        "InDesign",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    // Data Jobs
    {
      jobId: "fb9",
      title: "Data Analyst",
      company: "Analytics Corp",
      location: "Remote",
      description:
        "Analyze data, create visualizations, and provide insights using SQL, Python, and Excel.",
      salary: { min: 55000, max: 85000, currency: "USD" },
      tags: [
        "SQL",
        "Python",
        "Excel",
        "Data Analysis",
        "Tableau",
        "Statistics",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
    // General Jobs
    {
      jobId: "fb10",
      title: "Marketing Specialist",
      company: "Growth Marketing Inc",
      location: "Remote",
      description:
        "Plan and execute marketing campaigns, manage social media, and analyze campaign performance.",
      salary: { min: 45000, max: 70000, currency: "USD" },
      tags: [
        "Marketing",
        "Social Media",
        "Content",
        "Analytics",
        "Communication",
      ],
      url: "#",
      source: "Fallback",
      postedDate: new Date(),
    },
  ];

  // Filter jobs based on user skills if available
  if (skillsLower.length > 0) {
    const relevantJobs = allFallbackJobs.filter((job) => {
      const jobText = `${job.title} ${job.description} ${job.tags.join(
        " "
      )}`.toLowerCase();
      return skillsLower.some((skill) => jobText.includes(skill));
    });

    // Return relevant jobs or all if none match
    return relevantJobs.length > 0 ? relevantJobs : allFallbackJobs.slice(0, 5);
  }

  return allFallbackJobs.slice(0, 5);
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
    allJobs = getFallbackJobs(skills);
  }

  return allJobs;
}

module.exports = {
  fetchRemoteOKJobs,
  fetchRemotiveJobs,
  getFallbackJobs,
  fetchAllJobs,
};
