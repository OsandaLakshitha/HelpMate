/**
 * Rule-Based Logic Service
 * STEP 4: Apply business rules for job matching and recommendations
 */

// RULE 1: Calculate match score based on skill overlap
function calculateMatchScore(userSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 60; // Base score

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());

  let matchCount = 0;

  userSkillsLower.forEach((userSkill) => {
    jobSkillsLower.forEach((jobSkill) => {
      // Check for exact match or partial match
      if (userSkill.includes(jobSkill) || jobSkill.includes(userSkill)) {
        matchCount++;
      }
    });
  });

  // Calculate score: (matched skills / total job requirements) * 100
  const score = Math.min(Math.round((matchCount / jobSkills.length) * 100), 95);
  return Math.max(score, 50); // Minimum score of 50
}

// RULE 2: Identify skill gaps from job market
function identifySkillGaps(userSkills, jobRecommendations) {
  const skillFrequency = {};
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  // Count skill frequency across all jobs
  jobRecommendations.forEach((job) => {
    const jobSkills = job.tags || [];
    jobSkills.forEach((skill) => {
      const skillLower = skill.toLowerCase();
      skillFrequency[skillLower] = (skillFrequency[skillLower] || 0) + 1;
    });
  });

  // Find missing skills
  const missingSkills = Object.entries(skillFrequency)
    .filter(([skill]) => {
      return !userSkillsLower.some(
        (userSkill) => userSkill.includes(skill) || skill.includes(userSkill)
      );
    })
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 10) // Top 10
    .map(([skill, count]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      importance: count >= 5 ? "High" : count >= 3 ? "Medium" : "Low",
      missing: true,
      suggestions: [
        `Take an online course on ${skill}`,
        `Build a project using ${skill}`,
        `Get certified in ${skill}`,
      ],
    }));

  return missingSkills;
}

// RULE 3: Generate career paths based on skills
function generateCareerPaths(userSkills, experience) {
  const skillsLower = userSkills.map((s) => s.toLowerCase()).join(" ");
  const expYears = parseInt(experience || "0");

  const careerRules = [
    // Technology careers
    {
      condition: () =>
        skillsLower.match(/javascript|react|angular|vue|html|css/),
      paths: [
        {
          title: "Frontend Developer",
          description:
            "Specialize in building user interfaces and web applications",
          matchScore: 85,
          steps: [
            "Master React/Vue/Angular",
            "Learn responsive design",
            "Build portfolio projects",
            "Apply for frontend roles",
          ],
          requiredSkills: ["JavaScript", "React", "HTML", "CSS"],
          timeframe: expYears > 0 ? "Immediate" : "6-12 months",
        },
        {
          title: "Full Stack Developer",
          description: "Work on both frontend and backend development",
          matchScore: 80,
          steps: [
            "Learn backend technologies",
            "Master databases",
            "Build full-stack projects",
            "Gain experience",
          ],
          requiredSkills: ["JavaScript", "Node.js", "React", "MongoDB"],
          timeframe: expYears >= 2 ? "Immediate" : "1-2 years",
        },
      ],
    },

    // Backend/DevOps careers
    {
      condition: () =>
        skillsLower.match(/node|python|java|backend|api|database/),
      paths: [
        {
          title: "Backend Developer",
          description: "Build server-side applications and APIs",
          matchScore: 85,
          steps: [
            "Master backend framework",
            "Learn database design",
            "Understand APIs",
            "Build scalable systems",
          ],
          requiredSkills: ["Node.js", "Python", "SQL", "REST API"],
          timeframe: expYears > 0 ? "Immediate" : "6-12 months",
        },
        {
          title: "DevOps Engineer",
          description: "Manage infrastructure and deployment pipelines",
          matchScore: 75,
          steps: [
            "Learn Docker & Kubernetes",
            "Master CI/CD",
            "Understand cloud platforms",
            "Automate processes",
          ],
          requiredSkills: ["Docker", "AWS", "CI/CD", "Linux"],
          timeframe: expYears >= 2 ? "1-2 years" : "2-3 years",
        },
      ],
    },

    // Business careers
    {
      condition: () =>
        skillsLower.match(/business|management|marketing|sales|analysis/),
      paths: [
        {
          title: "Business Analyst",
          description: "Analyze business processes and requirements",
          matchScore: 85,
          steps: [
            "Learn data analysis",
            "Master Excel & tools",
            "Practice requirement gathering",
            "Get certified",
          ],
          requiredSkills: [
            "Business Analysis",
            "Excel",
            "Communication",
            "Data Analysis",
          ],
          timeframe: expYears > 0 ? "Immediate" : "6-12 months",
        },
        {
          title: "Project Manager",
          description: "Lead and manage projects from start to finish",
          matchScore: 80,
          steps: [
            "Get PMP certification",
            "Lead small projects",
            "Build team skills",
            "Gain experience",
          ],
          requiredSkills: [
            "Project Management",
            "Leadership",
            "Communication",
            "Agile",
          ],
          timeframe: expYears >= 2 ? "Immediate" : "2-3 years",
        },
      ],
    },

    // Design careers
    {
      condition: () =>
        skillsLower.match(/design|ui|ux|photoshop|figma|creative/),
      paths: [
        {
          title: "UI/UX Designer",
          description: "Design user interfaces and experiences",
          matchScore: 85,
          steps: [
            "Master design tools",
            "Learn user research",
            "Build portfolio",
            "Practice design thinking",
          ],
          requiredSkills: ["Figma", "UI Design", "UX Design", "Prototyping"],
          timeframe: expYears > 0 ? "Immediate" : "6-12 months",
        },
        {
          title: "Graphic Designer",
          description: "Create visual content and branding materials",
          matchScore: 80,
          steps: [
            "Master Adobe Creative Suite",
            "Build diverse portfolio",
            "Learn branding",
            "Network with clients",
          ],
          requiredSkills: [
            "Photoshop",
            "Illustrator",
            "Graphic Design",
            "Branding",
          ],
          timeframe: expYears > 0 ? "Immediate" : "6-12 months",
        },
      ],
    },

    // Healthcare careers
    {
      condition: () =>
        skillsLower.match(/healthcare|nursing|patient|medical|clinical/),
      paths: [
        {
          title: "Healthcare Administrator",
          description: "Manage healthcare facilities and operations",
          matchScore: 85,
          steps: [
            "Learn healthcare systems",
            "Understand regulations",
            "Gain clinical knowledge",
            "Get certified",
          ],
          requiredSkills: [
            "Healthcare Management",
            "HIPAA",
            "Medical Terminology",
            "Leadership",
          ],
          timeframe: expYears > 0 ? "Immediate" : "1-2 years",
        },
        {
          title: "Clinical Coordinator",
          description: "Coordinate patient care and clinical services",
          matchScore: 80,
          steps: [
            "Gain clinical experience",
            "Learn EHR systems",
            "Develop coordination skills",
            "Build expertise",
          ],
          requiredSkills: ["Patient Care", "EHR", "Clinical", "Communication"],
          timeframe: expYears >= 1 ? "Immediate" : "1-2 years",
        },
      ],
    },

    // Engineering careers
    {
      condition: () =>
        skillsLower.match(/engineering|autocad|mechanical|electrical|civil/),
      paths: [
        {
          title: "Design Engineer",
          description: "Design and develop engineering solutions",
          matchScore: 85,
          steps: [
            "Master CAD software",
            "Learn design principles",
            "Work on projects",
            "Get certified",
          ],
          requiredSkills: [
            "AutoCAD",
            "SolidWorks",
            "Engineering Design",
            "Problem Solving",
          ],
          timeframe: expYears > 0 ? "Immediate" : "1-2 years",
        },
        {
          title: "Project Engineer",
          description: "Lead engineering projects and teams",
          matchScore: 80,
          steps: [
            "Gain technical experience",
            "Learn project management",
            "Lead initiatives",
            "Get PE license",
          ],
          requiredSkills: [
            "Engineering",
            "Project Management",
            "Technical Skills",
            "Leadership",
          ],
          timeframe: expYears >= 2 ? "Immediate" : "2-3 years",
        },
      ],
    },

    // Education careers
    {
      condition: () =>
        skillsLower.match(/teaching|education|curriculum|training/),
      paths: [
        {
          title: "Instructional Designer",
          description: "Design educational content and learning experiences",
          matchScore: 85,
          steps: [
            "Learn instructional design",
            "Master e-learning tools",
            "Build course portfolio",
            "Get certified",
          ],
          requiredSkills: [
            "Instructional Design",
            "E-Learning",
            "Curriculum Development",
            "LMS",
          ],
          timeframe: expYears > 0 ? "Immediate" : "6-12 months",
        },
        {
          title: "Training Specialist",
          description: "Develop and deliver training programs",
          matchScore: 80,
          steps: [
            "Create training materials",
            "Learn adult learning",
            "Facilitate workshops",
            "Build expertise",
          ],
          requiredSkills: [
            "Training",
            "Presentation",
            "Communication",
            "Educational Technology",
          ],
          timeframe: expYears > 0 ? "Immediate" : "1-2 years",
        },
      ],
    },

    // General career path (fallback)
    {
      condition: () => true,
      paths: [
        {
          title: "Entry Level Professional",
          description: "Start your career and gain experience",
          matchScore: 70,
          steps: [
            "Identify your interests",
            "Build relevant skills",
            "Network with professionals",
            "Apply for entry-level positions",
          ],
          requiredSkills: [
            "Communication",
            "Teamwork",
            "Problem Solving",
            "Adaptability",
          ],
          timeframe: "Immediate",
        },
      ],
    },
  ];

  // Find matching career paths
  const matchedPaths = [];
  careerRules.forEach((rule) => {
    if (rule.condition()) {
      matchedPaths.push(...rule.paths);
    }
  });

  // Remove duplicates and return top 5
  const uniquePaths = matchedPaths.filter(
    (path, index, self) =>
      index === self.findIndex((p) => p.title === path.title)
  );

  return uniquePaths.slice(0, 5);
}

// RULE 4: Filter and rank jobs
function rankJobs(jobs, userSkills) {
  return jobs
    .map((job) => ({
      ...job,
      matchScore: calculateMatchScore(userSkills, job.tags || []),
    }))
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
    .slice(0, 15); // Return top 15 matches
}

module.exports = {
  calculateMatchScore,
  identifySkillGaps,
  generateCareerPaths,
  rankJobs,
};
