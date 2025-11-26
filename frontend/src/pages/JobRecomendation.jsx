import React, { useState, useRef } from "react";
import Img_hero from "../assets/Images/Img_hero.jpg";

// Job Recommendation page
// - API endpoint used: POST /api/recommendations
// - Each recommendation have: id, title, company, score, snippet, tags, url

function JobRecomendation() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const inputRef = useRef(null);

  const RECOMMEND_API_URL = "/api/recommendations";

  function onFileChange(e) {
    setError("");
    setSuccessMessage("");
    const f = e.target.files && e.target.files[0];
    if (!f) return setFile(null);
    if (f.type !== "application/pdf") {
      setFile(null);
      return setError("Please upload a PDF file (CV in .pdf format).");
    }
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      return setError("Please drop a PDF file.");
    }
    setFile(f);
  }

  function onDragOver(e) {
    e.preventDefault();
  }
  /*
  // Mock data function for testing without backend
  function loadMockData() {
    setError("");
    setLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      // Mock CV Analysis
      setCvAnalysis({
        name: "John Doe",
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "CSS", "HTML"],
        experience: "3 years of experience in full-stack development",
        location: "San Francisco, CA",
        contact: "john.doe@email.com",
      });

      // Mock Skill Gaps
      setSkillGaps([
        {
          skill: "TypeScript",
          importance: "High",
          missing: true,
          suggestions: [
            "Take an online TypeScript course on Udemy or Coursera",
            "Practice by converting existing JavaScript projects to TypeScript",
            "Read the official TypeScript documentation",
          ],
        },
        {
          skill: "Docker",
          importance: "Medium",
          missing: true,
          suggestions: [
            "Learn Docker basics through Docker's official tutorials",
            "Containerize your existing applications",
            "Practice with Docker Compose for multi-container apps",
          ],
        },
      ]);

      // Mock Career Paths
      setCareerPaths([
        {
          title: "Senior Frontend Developer",
          description:
            "Focus on advanced frontend technologies and team leadership",
          steps: [
            "Master TypeScript and advanced React patterns",
            "Learn state management with Redux or Zustand",
            "Gain experience in mentoring junior developers",
            "Lead a frontend project from conception to deployment",
          ],
        },
        {
          title: "Full-Stack Tech Lead",
          description:
            "Expand backend skills while maintaining frontend expertise",
          steps: [
            "Learn advanced backend frameworks (Express.js, NestJS)",
            "Master database design and optimization",
            "Develop DevOps and deployment skills",
            "Practice system architecture and scalability",
          ],
        },
      ]);

      // Mock Job Recommendations
      setRecommendations([
        {
          id: 1,
          title: "Frontend Developer",
          company: "TechCorp Inc",
          score: 0.92,
          snippet:
            "Join our dynamic team building cutting-edge web applications with React and TypeScript...",
          tags: ["React", "JavaScript", "CSS", "Remote"],
          url: "https://example.com/job1",
          source: "Mock API",
        },
        {
          id: 2,
          title: "Full-Stack Developer",
          company: "StartupXYZ",
          score: 0.87,
          snippet:
            "We're looking for a passionate developer to work on both frontend and backend systems...",
          tags: ["Node.js", "React", "MongoDB", "AWS"],
          url: "https://example.com/job2",
          source: "Mock API",
        },
        {
          id: 3,
          title: "React Developer",
          company: "Digital Solutions Ltd",
          score: 0.95,
          snippet:
            "Build responsive and interactive user interfaces using React and modern JavaScript...",
          tags: ["React", "Redux", "TypeScript", "On-site"],
          url: "https://example.com/job3",
          source: "Mock API",
        },
        {
          id: 4,
          title: "Junior Software Engineer",
          company: "Innovation Labs",
          score: 0.78,
          snippet:
            "Perfect opportunity for junior developers to grow their skills in a supportive environment...",
          tags: ["JavaScript", "Learning", "Mentorship", "Hybrid"],
          url: "https://example.com/job4",
          source: "Mock API",
        },
      ]);

      setSuccessMessage(
        "Mock data loaded successfully! This is how your results will look."
      );
      setLoading(false);
    }, 1500); // 1.5 second delay to simulate API call
  } */

  async function uploadAndGetRecommendations() {
    setError("");
    setRecommendations([]);
    setSuccessMessage("");

    if (!file) {
      setError("No CV selected. Please choose a PDF to upload.");
      return;
    }

    const form = new FormData();
    form.append("cv", file);

    try {
      setLoading(true);
      const res = await fetch(RECOMMEND_API_URL, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.recommendations || [];
      setRecommendations(list);

      const analysis =
        data.analysis || data.cvAnalysis || data.cv_analysis || null;
      const gaps = data.skillGaps || data.skill_gaps || data.gaps || [];
      const paths = data.careerPaths || data.career_paths || data.career || [];
      setCvAnalysis(analysis);
      setSkillGaps(Array.isArray(gaps) ? gaps : []);
      setCareerPaths(Array.isArray(paths) ? paths : []);

      setSuccessMessage(
        `Found ${list.length} recommendation${list.length === 1 ? "" : "s"}`
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 mt-15">
      <section className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>AI-Powered Career Analysis</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Find Your Perfect Job with
                <span className="text-teal-600"> Smart CV Analysis</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Upload your CV and get instant analysis, skill gap
                identification, career path recommendations, and personalized
                job matches powered by AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#upload"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:brightness-105 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Your CV
                </a>

                <button
                  onClick={() => {
                    if (inputRef.current) inputRef.current.click();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  </svg>
                  Browse Files
                </button>
              </div>
            </div>
            {/* Right Content - Image */}
            <div className="relative">
              <div>
                <img
                  src={Img_hero}
                  alt="Job Recommendation Analysis"
                  className="w-full h-160 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div
          id="upload"
          className="border-2 border-dashed border-teal-300 rounded-xl p-8 bg-gradient-to-br from-white to-teal-50/50 hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Upload Your CV
              </h3>
              <p className="text-slate-600 text-sm">
                Get instant AI-powered analysis and personalized recommendations
              </p>
            </div>

            <div className="space-y-4">
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
              />

              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-8 cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-all duration-300 text-center"
                onClick={() => inputRef.current && inputRef.current.click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-teal-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-teal-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="font-semibold text-slate-900">
                      {file.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(0)} KB • Ready to analyze
                    </div>
                    <div className="text-xs text-teal-600 font-medium">
                      Click to change file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-slate-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div className="font-medium text-slate-700">
                      Drag and drop your CV here
                    </div>
                    <div className="text-sm text-slate-500">
                      or click to browse files
                    </div>
                    <div className="text-xs text-slate-400">
                      Supports PDF files up to 10MB
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={uploadAndGetRecommendations}
                  disabled={loading || !file}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          opacity="0.25"
                        />
                        <path
                          d="M22 12a10 10 0 00-10-10"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Analyzing your CV...</span>
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
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Get AI Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mock Data Button for Testing */}
              {/*/
              <div className="flex justify-center mt-4">
                <button
                  onClick={loadMockData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Preview with Mock Data</span>
                </button>
              </div>
           */}

              <div className="text-center">
                <p className="text-xs text-slate-500">
                  🔒 Your CV is processed securely and deleted after analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 shadow-sm">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-emerald-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Results Section */}
      {(cvAnalysis ||
        skillGaps.length > 0 ||
        careerPaths.length > 0 ||
        recommendations.length > 0) && (
        <div className="mt-16 space-y-12">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Your AI-Powered Career Insights
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Based on your CV analysis, here's what we discovered about your
              career profile
            </p>
          </div>

          {/* CV Analysis Section */}
          {cvAnalysis && (
            <section className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    CV Analysis
                  </h3>
                  <p className="text-slate-600">
                    Professional summary and key insights
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-white/50">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h4 className="font-semibold text-slate-900">Summary</h4>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    {cvAnalysis.summary || "No summary available."}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Experience
                      </div>
                      <div className="font-medium text-slate-900">
                        {cvAnalysis.experience || "Not detected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Education
                      </div>
                      <div className="font-medium text-slate-900">
                        {cvAnalysis.education || "Not detected"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-white/50">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-slate-900">Top Skills</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(cvAnalysis.skills || []).length ? (
                      cvAnalysis.skills.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <div className="text-sm text-slate-600">
                        No skills detected
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-white/50">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h4 className="font-semibold text-slate-900">
                      Contact Info
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{cvAnalysis.location || "Location not found"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{cvAnalysis.contact || "Contact not found"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Skill Gap Analysis Section */}
          {skillGaps && skillGaps.length > 0 && (
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Skill Gap Analysis
                  </h3>
                  <p className="text-slate-600">
                    Skills to develop for your target roles
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skillGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-white/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">
                          {gap.skill}
                        </h4>
                        <div className="text-sm text-slate-500">
                          Importance: {gap.importance || "High"}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          gap.missing
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {gap.missing ? "Missing" : "Has skill"}
                      </span>
                    </div>
                    {gap.suggestions && gap.suggestions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-slate-700 mb-2">
                          How to develop this skill:
                        </div>
                        <ul className="space-y-1">
                          {gap.suggestions.map((s, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <svg
                                className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Career Path Recommendations Section */}
          {careerPaths && careerPaths.length > 0 && (
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Career Path Recommendations
                  </h3>
                  <p className="text-slate-600">
                    Strategic steps for your career growth
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {careerPaths.map((path, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-white/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-lg mb-2">
                          {path.title}
                        </h4>
                        <p className="text-slate-600 mb-4">
                          {path.description}
                        </p>
                        {path.steps && path.steps.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-slate-700 mb-3">
                              Action steps:
                            </div>
                            <ol className="space-y-2">
                              {path.steps.map((s, j) => (
                                <li
                                  key={j}
                                  className="flex items-start gap-3 text-sm text-slate-600"
                                >
                                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {j + 1}
                                  </span>
                                  {s}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Recommended Jobs Section */}
      {recommendations.length > 0 && (
        <section className="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Job Recommendations
              </h2>
              <p className="text-slate-600">
                Perfect matches based on your profile
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                {recommendations.length} matches found
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recommendations.map((r, idx) => (
              <article
                key={r.id || idx}
                className="p-4 rounded-lg shadow-sm border-l-4 border-transparent hover:shadow-md transition bg-white"
                style={{
                  borderLeftColor: `hsl(${(idx * 73) % 360}deg 70% 55%)`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {r.title || r.role || "Untitled role"}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {r.company ||
                        r.organisation ||
                        r.organization ||
                        "Company"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    <div className="font-medium">
                      {r.score
                        ? `${Math.round(r.score * 100)}% fit`
                        : r.match || "—"}
                    </div>
                  </div>
                </div>

                {r.snippet ? (
                  <p className="mt-3 text-sm text-gray-700">{r.snippet}</p>
                ) : null}

                {r.tags && r.tags.length ? (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {r.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between">
                  <a
                    href={r.url || r.link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    View role
                  </a>
                  <div className="text-xs text-gray-400">
                    Source: {r.source || "API"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Feedback Section */}
      <section className="mt-16 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            What Our Users Say
          </h2>
          <p className="text-slate-600">
            Real feedback from students and professionals who found their dream
            jobs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feedback Card 1 */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-700 mb-4 leading-relaxed">
              "The CV analysis was spot-on! It identified skills I didn't even
              realize I had and helped me land my dream job in tech. The career
              path suggestions were incredibly valuable."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                S
              </div>
              <div>
                <div className="font-semibold text-slate-900">Sarah Chen</div>
                <div className="text-sm text-slate-500">Software Engineer</div>
              </div>
            </div>
          </div>

          {/* Feedback Card 2 */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-700 mb-4 leading-relaxed">
              "Amazing skill gap analysis! I discovered exactly what I needed to
              learn to transition into data science. Got my first data analyst
              role within 3 months."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
                M
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  Mike Rodriguez
                </div>
                <div className="text-sm text-slate-500">Data Analyst</div>
              </div>
            </div>
          </div>

          {/* Feedback Card 3 */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-700 mb-4 leading-relaxed">
              "The career path recommendations opened my eyes to opportunities I
              never considered. Now I'm a product manager at a Fortune 500
              company!"
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                L
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  Lisa Thompson
                </div>
                <div className="text-sm text-slate-500">Product Manager</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>50K+ CVs analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>98% satisfaction rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Average 40% salary increase</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default JobRecomendation;
