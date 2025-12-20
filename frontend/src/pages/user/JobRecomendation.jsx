import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

// Job Recommendation System Flow:
// 1. User uploads PDF CV
// 2. Backend extracts text from PDF (pdfExtractor.service.js)
// 3. Backend matches skills from 8+ fields (skillMatcher.service.js)
// 4. Backend normalizes skills (skillNormalizer.service.js)
// 5. Backend fetches jobs from APIs (jobApi.service.js)
// 6. Backend applies rule-based matching (ruleEngine.service.js)
// 7. Backend returns: analysis, skillGaps, careerPaths, recommendations

function JobRecomendation() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [analysisId, setAnalysisId] = useState(null);
  const inputRef = useRef(null);

  const RECOMMEND_API_URL = `${API_URL}/api/recommendations`;

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

  async function uploadAndGetRecommendations() {
    // Reset states
    setError("");
    setRecommendations([]);
    setCvAnalysis(null);
    setSkillGaps([]);
    setCareerPaths([]);
    setSuccessMessage("");
    setAnalysisId(null);

    if (!file) {
      setError("No CV selected. Please choose a PDF to upload.");
      return;
    }

    const form = new FormData();
    form.append("cv", file);

    try {
      setLoading(true);

      // Prepare headers (optional auth)
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(RECOMMEND_API_URL, {
        method: "POST",
        headers: headers,
        body: form,
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Server error" }));
        throw new Error(
          errorData.error || errorData.message || `Server error ${res.status}`
        );
      }

      const data = await res.json();

      // Backend returns: { success, message, analysis, skillGaps, careerPaths, recommendations, analysisId }
      if (data.success) {
        // Set CV Analysis data (name, email, phone, experience, skills)
        setCvAnalysis(data.analysis || null);

        // Set Skill Gaps (skills missing from job market)
        setSkillGaps(Array.isArray(data.skillGaps) ? data.skillGaps : []);

        // Set Career Paths (recommended career directions)
        setCareerPaths(Array.isArray(data.careerPaths) ? data.careerPaths : []);

        // Set Job Recommendations (matched jobs from services)
        setRecommendations(
          Array.isArray(data.recommendations) ? data.recommendations : []
        );

        // Save analysis ID for future reference
        setAnalysisId(data.analysisId || null);

        const jobCount = data.recommendations?.length || 0;
        setSuccessMessage(
          data.message ||
            `CV analyzed successfully! Found ${jobCount} job match${
              jobCount === 1 ? "" : "es"
            } based on your skills.`
        );
      } else {
        throw new Error(data.error || data.message || "Failed to analyze CV");
      }
    } catch (err) {
      console.error("CV Upload Error:", err);
      setError(err.message || "Failed to analyze CV. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 mt-15">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <section className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-8 animate-fade-in-up overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center">
            {/* Animated Icon */}
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6 hover-lift">
                <svg
                  className="w-4 h-4 animate-pulse-slow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Smart CV-to-Job Matching</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Find Your Perfect Job with
                <span className="text-teal-600"> Intelligent CV Analysis</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Upload your CV and our system extracts your skills, matches them
                with 8+ career fields, identifies skill gaps, suggests career
                paths, and recommends jobs from multiple sources.
              </p>

              {/* Animated Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 animate-scale-in">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm hover-lift">
                  <div className="text-2xl font-bold text-teal-600">98%</div>
                  <div className="text-xs text-slate-600">Accuracy</div>
                </div>
                <div
                  className="text-center p-4 bg-white rounded-xl shadow-sm hover-lift"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="text-2xl font-bold text-cyan-600">5K+</div>
                  <div className="text-xs text-slate-600">Jobs Analyzed</div>
                </div>
                <div
                  className="text-center p-4 bg-white rounded-xl shadow-sm hover-lift"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="text-2xl font-bold text-emerald-600">
                    2min
                  </div>
                  <div className="text-xs text-slate-600">Avg Analysis</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#upload"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:brightness-105 hover:scale-105 transition-all duration-300"
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
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-teal-300 hover:scale-105 transition-all duration-300"
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
          </div>
        </div>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div
          id="upload"
          className="border-2 border-dashed border-teal-300 rounded-xl p-8 bg-gradient-to-br from-white to-teal-50/50 hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md hover-lift"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center animate-float shadow-lg">
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl hover:brightness-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
        <div className="mt-16 space-y-12 animate-fade-in-up">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-stagger-fade-in">
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
                    <h4 className="font-semibold text-slate-900">Profile</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Name
                      </div>
                      <div className="font-medium text-slate-900">
                        {cvAnalysis.name || "Not detected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Experience
                      </div>
                      <div className="font-medium text-slate-900">
                        {cvAnalysis.experience
                          ? `${cvAnalysis.experience} years`
                          : "Not detected"}
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
                    <h4 className="font-semibold text-slate-900">
                      Skills Extracted
                    </h4>
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
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
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
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="break-all">
                        {cvAnalysis.email || "Email not found"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{cvAnalysis.phone || "Phone not found"}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-stagger">
            {recommendations.map((r, idx) => (
              <article
                key={r.jobId || idx}
                className="p-4 rounded-lg shadow-sm border-l-4 border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
                style={{
                  borderLeftColor: `hsl(${(idx * 73) % 360}deg 70% 55%)`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {r.title || "Untitled Position"}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {r.company || "Company"}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {r.location || "Remote"}
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    {r.score !== undefined && (
                      <div className="font-semibold text-teal-600">
                        {Math.round(r.score)}% match
                      </div>
                    )}
                    {r.source && (
                      <div className="text-xs text-gray-400 mt-1">
                        via {r.source}
                      </div>
                    )}
                  </div>
                </div>

                {r.description && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                    {r.description.replace(/<[^>]*>/g, "").substring(0, 150)}
                    {r.description.length > 150 ? "..." : ""}
                  </p>
                )}

                {r.tags && r.tags.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {r.tags.slice(0, 5).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {r.tags.length > 5 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        +{r.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <a
                    href={r.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1"
                  >
                    View Job Details
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  {r.postedDate && (
                    <div className="text-xs text-gray-400">
                      {new Date(r.postedDate).toLocaleDateString()}
                    </div>
                  )}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-stagger">
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
