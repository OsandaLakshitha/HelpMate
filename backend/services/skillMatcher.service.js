// Comprehensive skill database for all fields
const SKILL_DATABASE = {
  // Technology & Programming
  technology: [
    "javascript",
    "python",
    "java",
    "c++",
    "c#",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "react",
    "angular",
    "vue",
    "node.js",
    "express",
    "django",
    "flask",
    "spring boot",
    "html",
    "css",
    "typescript",
    "sql",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "git",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "jenkins",
    "ci/cd",
    "rest api",
    "graphql",
    "microservices",
    "agile",
    "scrum",
    "devops",
  ],

  // Business & Management
  business: [
    "project management",
    "business analysis",
    "strategic planning",
    "market research",
    "sales",
    "marketing",
    "digital marketing",
    "seo",
    "content marketing",
    "social media",
    "crm",
    "salesforce",
    "excel",
    "powerpoint",
    "data analysis",
    "reporting",
    "budgeting",
    "financial analysis",
    "accounting",
    "quickbooks",
    "erp",
    "sap",
    "negotiation",
    "stakeholder management",
    "team leadership",
    "pmp",
    "agile",
  ],

  // Healthcare
  healthcare: [
    "patient care",
    "nursing",
    "medical terminology",
    "clinical",
    "healthcare management",
    "ehr",
    "epic",
    "cerner",
    "medical coding",
    "icd-10",
    "hipaa",
    "phlebotomy",
    "cpr",
    "first aid",
    "vital signs",
    "medication administration",
    "charting",
    "case management",
    "healthcare it",
    "telemedicine",
    "medical records",
  ],

  // Engineering
  engineering: [
    "autocad",
    "solidworks",
    "catia",
    "matlab",
    "ansys",
    "revit",
    "cad",
    "mechanical design",
    "electrical engineering",
    "civil engineering",
    "structural analysis",
    "plc programming",
    "circuit design",
    "hvac",
    "manufacturing",
    "quality control",
    "lean manufacturing",
    "six sigma",
    "3d modeling",
    "fem analysis",
    "technical drawing",
  ],

  // Education
  education: [
    "teaching",
    "curriculum development",
    "lesson planning",
    "classroom management",
    "student assessment",
    "educational technology",
    "e-learning",
    "lms",
    "moodle",
    "canvas",
    "instructional design",
    "tutoring",
    "mentoring",
    "special education",
    "pedagogy",
    "training",
    "workshops",
    "public speaking",
    "educational research",
  ],

  // Creative & Design
  creative: [
    "graphic design",
    "adobe photoshop",
    "illustrator",
    "indesign",
    "premiere pro",
    "after effects",
    "figma",
    "sketch",
    "ui design",
    "ux design",
    "user research",
    "wireframing",
    "prototyping",
    "branding",
    "typography",
    "color theory",
    "video editing",
    "photography",
    "animation",
    "motion graphics",
    "creative writing",
  ],

  // Science & Research
  science: [
    "research methodology",
    "data collection",
    "statistical analysis",
    "spss",
    "r programming",
    "laboratory techniques",
    "experimental design",
    "scientific writing",
    "literature review",
    "microscopy",
    "chromatography",
    "spectroscopy",
    "molecular biology",
    "chemistry",
    "physics",
    "biology",
    "environmental science",
    "grant writing",
    "peer review",
  ],

  // Soft Skills (Universal)
  soft: [
    "communication",
    "teamwork",
    "leadership",
    "problem solving",
    "critical thinking",
    "time management",
    "adaptability",
    "creativity",
    "collaboration",
    "presentation",
    "interpersonal skills",
    "organizational skills",
    "analytical thinking",
    "attention to detail",
    "multitasking",
    "conflict resolution",
    "decision making",
    "work ethic",
  ],
};

// Match keywords from CV text
function matchKeywords(text) {
  const textLower = text.toLowerCase();
  const foundSkills = [];

  // Flatten all skills into one array
  const allSkills = Object.values(SKILL_DATABASE).flat();

  // Match skills from CV text
  allSkills.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      // Capitalize first letter of each word
      const capitalizedSkill = skill
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      foundSkills.push(capitalizedSkill);
    }
  });

  // Remove duplicates
  return [...new Set(foundSkills)];
}

module.exports = {
  matchKeywords,
  SKILL_DATABASE,
};
