/**
 * Convert user profile to numbers for clustering
 * Uses only: university, interests, plan, skills, academicLevel
 *
 * @param {Object} user - 
 * @returns {Array} - Array of 4 numbers representing the user

 */
const userToNumbers = (user) => {
  const numbers = [];

  // 1. Academic level: freshman=1, sophomore=2, junior=3, senior=4, graduate=5
  const levelMap = {
    freshman: 1,
    sophomore: 2,
    junior: 3,
    senior: 4,
    graduate: 5,
    other: 3,
  };
  numbers.push(levelMap[user.academicLevel] || 3);

  // 2. Number of interests (0-10)
  numbers.push(Math.min((user.interests || []).length, 10));

  // 3. Number of skills (0-10)
  numbers.push(Math.min((user.skills || []).length, 10));

  // 4. Plan: Free=1, Pro=2, Enterprise=3
  const planMap = { Free: 1, Pro: 2, Enterprise: 3 };
  numbers.push(planMap[user.plan] || 1);

  return numbers;
};

/**
 * Calculate match score between two users
 *
 * @param {Object} user1
 * @param {Object} user2
 * @returns {number} - Match score (0-100 points)
 *
 * Scoring breakdown:
 *   - Same university: +20 points
 *   - Common interests: +10 each (max 30)
 *   - Common skills: +10 each (max 30)
 *   - Same plan: +10 points
 *   - Same academic level: +10 points
 * Total possible: 100 points
 */
const calculateMatchScore = (user1, user2) => {
  let score = 0;

  // 1. Same university? +20 points
  if (
    user1.university &&
    user2.university &&
    user1.university.toLowerCase() === user2.university.toLowerCase()
  ) {
    score += 20;
  }

  // 2. Common interests? +10 points each (max 30)
  const commonInterests = (user1.interests || []).filter((interest) =>
    (user2.interests || []).includes(interest)
  ).length;
  score += Math.min(commonInterests * 10, 30);

  // 3. Common skills? +10 points each (max 30)
  const commonSkills = (user1.skills || []).filter((skill) =>
    (user2.skills || []).includes(skill)
  ).length;
  score += Math.min(commonSkills * 10, 30);

  // 4. Same plan? +10 points
  if (user1.plan === user2.plan) {
    score += 10;
  }

  // 5. Same academic level? +10 points
  if (user1.academicLevel === user2.academicLevel) {
    score += 10;
  }

  return score; // Max possible: 100 points
};

module.exports = {
  userToNumbers,
  calculateMatchScore,
};
