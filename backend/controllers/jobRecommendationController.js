const CVAnalysis = require("../models/CVAnalysis");
const JobSearch = require("../models/JobSearch");

// Import Services (Clean architecture - separation of concerns)
const pdfExtractorService = require("../services/pdfExtractor.service");
const skillMatcherService = require("../services/skillMatcher.service");
const skillNormalizerService = require("../services/skillNormalizer.service");
const jobApiService = require("../services/jobApi.service");
const ruleEngineService = require("../services/ruleEngine.service");

// MAIN CONTROLLER: Upload and Analyze CV
exports.uploadAndAnalyzeCV = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file" });
    }

    // STEP 1: Extract text from PDF (using PDF Extractor Service)
    const extractedText = await pdfExtractorService.extractTextFromPDF(
      req.file.buffer
    );

    if (!extractedText || extractedText.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Could not extract enough text from PDF" });
    }

    // Extract basic information
    const basicInfo = pdfExtractorService.extractBasicInfo(extractedText);

    // STEP 2: Match keywords (using Skill Matcher Service)
    const rawSkills = skillMatcherService.matchKeywords(extractedText);

    // STEP 3: Normalize skills (using Skill Normalizer Service)
    const normalizedSkills = skillNormalizerService.normalizeSkills(rawSkills);

    if (normalizedSkills.length === 0) {
      return res.status(400).json({
        error:
          "No skills detected in CV. Please ensure your CV contains relevant skills.",
      });
    }

    // Prepare analysis object
    const analysis = {
      ...basicInfo,
      skills: normalizedSkills,
    };

    // Fetch jobs from APIs (using Job API Service)
    const allJobs = await jobApiService.fetchAllJobs(normalizedSkills);

    // STEP 4: Apply rule-based logic (using Rule Engine Service)
    const rankedJobs = ruleEngineService.rankJobs(allJobs, normalizedSkills);
    const skillGaps = ruleEngineService.identifySkillGaps(
      normalizedSkills,
      rankedJobs
    );
    const careerPaths = ruleEngineService.generateCareerPaths(
      normalizedSkills,
      basicInfo.experience
    );

    // Save to database
    const cvAnalysis = new CVAnalysis({
      userId: req.user?._id || null,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedText: extractedText,
      analysis: analysis,
      skillGaps: skillGaps,
      careerPaths: careerPaths,
      jobRecommendations: rankedJobs,
    });

    await cvAnalysis.save();

    // Return response
    res.status(200).json({
      success: true,
      message: "CV analyzed successfully",
      analysis: analysis,
      skillGaps: skillGaps,
      careerPaths: careerPaths,
      recommendations: rankedJobs,
      analysisId: cvAnalysis._id,
    });
  } catch (error) {
    console.error("CV Analysis Error:", error);
    res.status(500).json({
      error: "Failed to analyze CV",
      details: error.message,
    });
  }
};

// GET CV ANALYSIS HISTORY

exports.getCVAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await CVAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-extractedText");

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

// GET SPECIFIC CV ANALYSIS BY ID
exports.getCVAnalysisById = async (req, res) => {
  try {
    const analysis = await CVAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
};

// SEARCH JOBS WITH CUSTOM QUERY
exports.searchJobs = async (req, res) => {
  try {
    const { keywords, location, jobType } = req.body;

    // Fetch jobs from APIs (using Job API Service)
    let allJobs = await jobApiService.fetchAllJobs(keywords || []);

    // Apply filters if needed (location, jobType, etc.)
    if (location) {
      allJobs = allJobs.filter((job) =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Rank jobs if keywords provided
    if (keywords && keywords.length > 0) {
      allJobs = ruleEngineService.rankJobs(allJobs, keywords);
    }

    // Save search
    const jobSearch = new JobSearch({
      userId: req.user._id,
      searchQuery: { keywords, location, jobType },
      results: allJobs,
      totalResults: allJobs.length,
    });

    await jobSearch.save();

    res.status(200).json({
      success: true,
      count: allJobs.length,
      data: allJobs,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to search jobs" });
  }
};

// GET JOB SEARCH HISTORY

exports.getJobSearchHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await JobSearch.find({ userId })
      .sort({ searchedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch search history" });
  }
};

// SAVE A JOB (Bookmark)

exports.saveJob = async (req, res) => {
  try {
    const { jobId, searchId } = req.body;

    const search = await JobSearch.findById(searchId);

    if (!search) {
      return res.status(404).json({ error: "Search not found" });
    }

    // Find and update the job
    const job = search.results.find((j) => j.jobId === jobId);
    if (job) {
      job.isSaved = true;
      await search.save();
    }

    res.status(200).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save job" });
  }
};
