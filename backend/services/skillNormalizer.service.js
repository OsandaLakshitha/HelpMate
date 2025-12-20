const NORMALIZATION_MAP = {
  nodejs: "Node.js",
  node: "Node.js",
  reactjs: "React",
  "react.js": "React",
  vuejs: "Vue",
  "vue.js": "Vue",
  angularjs: "Angular",
  mongodb: "MongoDB",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  aws: "AWS",
  "amazon web services": "AWS",
  azure: "Microsoft Azure",
  "google cloud": "GCP",
  "ci/cd": "CI/CD",
  "rest api": "REST API",
  restful: "REST API",
  graphql: "GraphQL",
  "ui/ux": "UI/UX Design",
  photoshop: "Adobe Photoshop",
  illustrator: "Adobe Illustrator",
  indesign: "Adobe InDesign",
  premiere: "Adobe Premiere Pro",
  "after effects": "Adobe After Effects",
  autocad: "AutoCAD",
  solidworks: "SolidWorks",
  pmp: "PMP Certification",
  "six sigma": "Six Sigma",
  agile: "Agile Methodology",
  scrum: "Scrum",
  html5: "HTML",
  css3: "CSS",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
};

// Normalize skills to standard forms
function normalizeSkills(skills) {
  const normalizedSkills = skills.map((skill) => {
    const skillLower = skill.toLowerCase().trim();
    return NORMALIZATION_MAP[skillLower] || skill;
  });

  // Remove duplicates after normalization
  return [...new Set(normalizedSkills)];
}

module.exports = {
  normalizeSkills,
  NORMALIZATION_MAP,
};
