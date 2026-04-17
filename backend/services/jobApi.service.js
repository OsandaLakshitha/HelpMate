const axios = require("axios");

// Calculate relevance score for a job based on user skills
function calculateJobRelevance(job, userSkills) {
  const skillsLower = userSkills.map((s) => s.toLowerCase().trim());
  const title = (job.position || job.title || "").toLowerCase();
  const description = (job.description || "").toLowerCase();
  const tags = (job.tags || []).map((t) => t.toLowerCase());
  const category = (job.category || "").toLowerCase();

  let score = 0;
  let matchedSkills = 0;

  skillsLower.forEach((skill) => {
    // Exact word boundary match is more accurate
    const skillRegex = new RegExp(
      `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );

    // Title match - highest weight (5 points)
    if (skillRegex.test(title)) {
      score += 5;
      matchedSkills++;
    }

    // Tags match - high weight (3 points)
    if (tags.some((tag) => skillRegex.test(tag))) {
      score += 3;
      matchedSkills++;
    }

    // Category match - medium weight (2 points)
    if (skillRegex.test(category)) {
      score += 2;
      matchedSkills++;
    }

    // Description match - lower weight (1 point)
    if (skillRegex.test(description)) {
      score += 1;
      matchedSkills++;
    }
  });

  return { score, matchedSkills };
}

// Fetch jobs from RemoteOK API
async function fetchRemoteOKJobs(skills) {
  try {
    const response = await axios.get("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const jobs = response.data.slice(1, 150); // Get more jobs for better filtering

    // Calculate relevance score for each job
    const jobsWithScores = jobs.map((job) => {
      const { score, matchedSkills } = calculateJobRelevance(job, skills);
      return { job, score, matchedSkills };
    });

    // Filter: require at least 2 points OR 2 matched skills for relevance
    const relevantJobs = jobsWithScores
      .filter((item) => item.score >= 2 || item.matchedSkills >= 2)
      .sort((a, b) => {
        // Sort by score first, then by matched skills
        if (b.score !== a.score) return b.score - a.score;
        return b.matchedSkills - a.matchedSkills;
      })
      .slice(0, 30) // Take top 30 most relevant jobs
      .map((item) => item.job);

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
      params: { limit: 150 },
      timeout: 10000,
    });

    const jobs = response.data.jobs || [];

    // Calculate relevance score for each job
    const jobsWithScores = jobs.map((job) => {
      const { score, matchedSkills } = calculateJobRelevance(job, skills);
      return { job, score, matchedSkills };
    });

    // Filter: require at least 2 points OR 2 matched skills for relevance
    const relevantJobs = jobsWithScores
      .filter((item) => item.score >= 2 || item.matchedSkills >= 2)
      .sort((a, b) => {
        // Sort by score first, then by matched skills
        if (b.score !== a.score) return b.score - a.score;
        return b.matchedSkills - a.matchedSkills;
      })
      .slice(0, 30) // Take top 30 most relevant jobs
      .map((item) => item.job);

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
        " ",
      )}`.toLowerCase();
      return skillsLower.some((skill) => jobText.includes(skill));
    });

    // Return relevant jobs or all if none match
    return relevantJobs.length > 0 ? relevantJobs : allFallbackJobs.slice(0, 5);
  }

  return allFallbackJobs.slice(0, 5);
}

// Fetch jobs from Arbeitnow API (No API key required)
async function fetchArbeitnowJobs(skills) {
  try {
    const response = await axios.get(
      "https://www.arbeitnow.com/api/job-board-api",
      {
        timeout: 10000,
      },
    );

    const jobs = response.data.data || [];

    // Calculate relevance score for each job
    const jobsWithScores = jobs.map((job) => {
      const { score, matchedSkills } = calculateJobRelevance(job, skills);
      return { job, score, matchedSkills };
    });

    // Filter: require at least 2 points OR 2 matched skills for relevance
    const relevantJobs = jobsWithScores
      .filter((item) => item.score >= 2 || item.matchedSkills >= 2)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.matchedSkills - a.matchedSkills;
      })
      .slice(0, 30)
      .map((item) => item.job);

    return relevantJobs.map((job) => ({
      jobId: job.slug || String(Math.random()),
      title: job.title || "Position Available",
      company: job.company_name || "Company",
      location: job.location || "Remote",
      description: job.description || "No description available",
      salary: { min: null, max: null, currency: "EUR" },
      tags: job.tags || [],
      url: job.url || "#",
      source: "Arbeitnow",
      postedDate: job.created_at ? new Date(job.created_at) : new Date(),
    }));
  } catch (error) {
    console.error("Arbeitnow API Error:", error.message);
    return [];
  }
}

// Fetch jobs from The Muse API (No API key required)
async function fetchTheMuseJobs(skills) {
  try {
    const response = await axios.get(
      "https://www.themuse.com/api/public/jobs",
      {
        params: { page: 0, descending: true },
        timeout: 10000,
      },
    );

    const jobs = response.data.results || [];

    // Calculate relevance score for each job
    const jobsWithScores = jobs.map((job) => {
      const { score, matchedSkills } = calculateJobRelevance(job, skills);
      return { job, score, matchedSkills };
    });

    // Filter: require at least 2 points OR 2 matched skills for relevance
    const relevantJobs = jobsWithScores
      .filter((item) => item.score >= 2 || item.matchedSkills >= 2)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.matchedSkills - a.matchedSkills;
      })
      .slice(0, 30)
      .map((item) => item.job);

    return relevantJobs.map((job) => ({
      jobId: String(job.id),
      title: job.name || "Position Available",
      company: job.company?.name || "Company",
      location: job.locations?.map((loc) => loc.name).join(", ") || "Remote",
      description: job.contents || "No description available",
      salary: { min: null, max: null, currency: "USD" },
      tags: job.categories?.map((cat) => cat.name) || [],
      url: job.refs?.landing_page || "#",
      source: "TheMuse",
      postedDate: job.publication_date
        ? new Date(job.publication_date)
        : new Date(),
    }));
  } catch (error) {
    console.error("The Muse API Error:", error.message);
    return [];
  }
}

// Fetch all jobs from multiple sources
async function fetchAllJobs(skills) {
  let allJobs = [];

  // Try RemoteOK
  const remoteOKJobs = await fetchRemoteOKJobs(skills);
  allJobs.push(...remoteOKJobs);

  // Try Remotive
  const remotiveJobs = await fetchRemotiveJobs(skills);
  allJobs.push(...remotiveJobs);

  // Try Arbeitnow (No API key needed - Tech jobs in Europe)
  const arbeitnowJobs = await fetchArbeitnowJobs(skills);
  allJobs.push(...arbeitnowJobs);

  // Try The Muse (No API key needed - Quality listings)
  const theMuseJobs = await fetchTheMuseJobs(skills);
  allJobs.push(...theMuseJobs);

  // Use fallback if no jobs found
  if (allJobs.length === 0) {
    allJobs = getFallbackJobs(skills);
  }

  return allJobs;
}

module.exports = {
  fetchRemoteOKJobs,
  fetchRemotiveJobs,
  fetchArbeitnowJobs,
  fetchTheMuseJobs,
  getFallbackJobs,
  fetchAllJobs,
};
