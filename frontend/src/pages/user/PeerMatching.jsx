import React, { useState } from "react";

function PeerMatching() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data for demonstration
  const mockMatches = [
    {
      id: 1,
      name: "Sarah Chen",
      matchPercentage: 92,
      location: "Computer Science, University of Colombo",
      commonInterests: ["Machine Learning", "Web Development", "Data Science"],
      studyStyle: "Group Study",
      availability: "Evenings & Weekends",
      currentProjects: ["React Portfolio", "ML Research Project"],
      profileImage: "SC",
    },
    {
      id: 2,
      name: "Ahmed Hassan",
      matchPercentage: 87,
      location: "Software Engineering, SLIIT",
      commonInterests: ["JavaScript", "Mobile Development", "UI/UX Design"],
      studyStyle: "Pair Programming",
      availability: "Mornings & Afternoons",
      currentProjects: ["Flutter App", "Design System"],
      profileImage: "AH",
    },
    {
      id: 3,
      name: "Priya Sharma",
      matchPercentage: 84,
      location: "Information Technology, University of Moratuwa",
      commonInterests: ["Python", "Data Analysis", "Research"],
      studyStyle: "Independent + Discussion",
      availability: "Flexible Schedule",
      currentProjects: ["Data Analytics Dashboard", "Research Paper"],
      profileImage: "PS",
    },
    {
      id: 4,
      name: "Michael Johnson",
      matchPercentage: 78,
      location: "Computer Engineering, University of Peradeniya",
      commonInterests: [
        "Algorithms",
        "System Design",
        "Competitive Programming",
      ],
      studyStyle: "Problem Solving Sessions",
      availability: "Late Evenings",
      currentProjects: ["Coding Competitions", "System Architecture"],
      profileImage: "MJ",
    },
  ];

  const findMatches = async () => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // This will be replaced with actual API call to backend
      // const response = await fetch('/api/peers/find-matches', { method: 'POST' });
      // const data = await response.json();
      // setMatches(data.matches);

      setMatches(mockMatches);
      setHasSearched(true);
      setLoading(false);
    }, 2000);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 80) return "text-blue-600 bg-blue-50";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const connectWithPeer = (peerId) => {
    // This will be implemented with backend integration
    console.log(`Connecting with peer ID: ${peerId}`);
    alert("Connection request sent! (Backend integration pending)");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-15">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Find Your Perfect
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {" "}
            Study Buddy
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Connect with like-minded students who share your interests and
          learning goals. Our AI-powered matching system uses K-means clustering
          to find your ideal study partners.
        </p>
      </div>

      {/* Find Friends Button */}
      <div className="text-center mb-12">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Ready to Find Your Study Partners?
            </h2>
            <p className="text-slate-600 mb-6">
              Click below to discover students with similar interests, study
              styles, and academic goals using our advanced matching algorithm.
            </p>
            <button
              onClick={findMatches}
              disabled={loading}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Finding Your Perfect Matches...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Find a Friend
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Analyzing Your Profile...
          </h3>
          <p className="text-slate-600">
            Using K-means clustering to find your perfect study matches
          </p>
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Processing interests...</span>
              <span>92%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                style={{ width: "92%" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Match Results */}
      {hasSearched && !loading && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Your Study Buddy Matches
              </h2>
              <p className="text-slate-600">
                Found {matches.length} compatible study partners
              </p>
            </div>
            <button
              onClick={findMatches}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-300"
            >
              Refresh Matches
            </button>
          </div>

          {matches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Match Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {match.profileImage}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">
                            {match.name}
                          </h3>
                          <p className="text-slate-600 text-sm">
                            {match.location}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full font-semibold text-sm ${getMatchColor(
                          match.matchPercentage
                        )}`}
                      >
                        {match.matchPercentage}% Match
                      </div>
                    </div>

                    {/* Common Interests */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Common Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.commonInterests
                          .slice(0, 3)
                          .map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        {match.commonInterests.length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            +{match.commonInterests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Summary */}
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Match Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Study Style:</span>
                          <span className="font-medium text-slate-800">
                            {match.studyStyle}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Availability:</span>
                          <span className="font-medium text-slate-800">
                            {match.availability}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-slate-600">
                            Current Projects:
                          </span>
                          <div className="text-right">
                            {match.currentProjects.map((project, index) => (
                              <div
                                key={index}
                                className="font-medium text-slate-800 text-xs"
                              >
                                {project}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6">
                    <div className="flex gap-3">
                      <button
                        onClick={() => connectWithPeer(match.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:brightness-105 transition-all duration-300"
                      >
                        Connect
                      </button>
                      <button className="px-4 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all duration-300">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No Matches Found
              </h3>
              <p className="text-slate-600">
                Try updating your profile or check back later for new users.
              </p>
            </div>
          )}
        </div>
      )}

      {/* How It Works Section */}
      <div className="mt-16 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          How K-Means Clustering Finds Your Perfect Match
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Profile Analysis</h3>
            <p className="text-sm text-slate-600">
              Analyzes your interests, study habits, and learning preferences to
              create a unique profile vector.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Smart Clustering</h3>
            <p className="text-sm text-slate-600">
              Groups students with similar profiles using advanced K-means
              clustering algorithm for optimal matching.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Perfect Matches</h3>
            <p className="text-sm text-slate-600">
              Presents you with highly compatible study partners ranked by
              similarity score and common interests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerMatching;
