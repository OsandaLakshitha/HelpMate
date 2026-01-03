# HelpMate - Intelligent Study Content Generation Module

> A Multi-Agent Adaptive Study Scheduling System with Deadline-Aware Content Delivery

## 📚 Overview

HelpMate is an AI-powered adaptive learning platform designed to enhance academic performance through personalized, data-driven study experiences. The Intelligent Study Content Generation Module is the core intelligence engine that transforms passive lecture materials into active learning tools—including quizzes (MCQs), flashcards, and summarized notes—while intelligently aligning their delivery with user-defined exam deadlines and study goals.

## 🎯 The Problem

Students often struggle with:
- Poor time management and delayed exam preparation
- Lack of structured revision resources
- Manual effort required to create study materials
- Generic tools that don't integrate with personal schedules

## ✨ The Solution

HelpMate transforms static lecture notes into an intelligent, proactive tutoring system by:
- **Automatically converting** uploaded lecture notes into interactive study assets
- **Dynamically adjusting** what and when to study based on exam dates
- **Delivering just-in-time practice** as exams approach

## 🚀 Key Features

### 1. **Lecture Note Upload & Text Extraction**
- Upload lecture notes in PDF format via `/user/notes/upload`
- Secure storage using `multer`
- Text extraction using `pdf-parse`
- Automatic cleaning and segmentation for processing

**Example**: Upload "Database Design.pdf" → extracts key concepts like normalization, primary keys, ACID properties

### 2. **AI-Powered Content Generation**

Using a fine-tuned T5-base model, the system generates:

#### ✅ Multiple-Choice Questions (MCQs)
```
Question: What is the purpose of a foreign key?
Options: 
A) To uniquely identify rows
B) To create relationships between tables ← Correct
C) To encrypt data
D) To index queries
```

#### ✅ Flashcards
```
Front: What is normalization?
Back: The process of organizing data to reduce redundancy and improve integrity.
```

#### ✅ Summarized Notes
Abstractive summaries using BART/T5 for concise revision sheets

### 3. **Exam Date Integration**
```json
{
  "subject": "Database Systems",
  "examDate": "2026-02-15T09:00:00Z"
}
```
- Sync with Google Calendar or internal calendar UI
- Drives the entire adaptive study schedule

### 4. **Deadline-Based Adaptive Content Delivery**

| Time Until Exam | Strategy |
|----------------|----------|
| > 3 weeks | Generate all content; suggest weekly review sessions |
| 2–3 weeks | Begin low-intensity spaced repetition (every 5 days) |
| 1–2 weeks | Increase frequency (every 2–3 days), focus on weak areas |
| < 1 week | Daily quizzes, flashcard drills, last-minute summaries |

**Example**: If "Database Exam" is in 5 days → system sends daily notifications:
> 👉 "Practice 10 MCQs on Normalization today!"

### 5. **Interactive Quiz Engine**
- Select answers (A/B/C/D)
- Instant feedback with explanations
- Score tracking and weak topic detection
- Results feed into performance prediction system

### 6. **Multi-Agent Integration**

| Output | Destination | Use Case |
|--------|------------|----------|
| User quiz scores | Performance Predictor | Detect weak areas |
| Generated content | Spacing Agent (SM-2) | Schedule reviews |
| Topic mastery level | Rescheduler Agent | Adjust plan if behind |
| Exam date + load | Focus Window Predictor | Optimize timing |
| VARK profile | Resource Recommender | Send video/audio summaries |

## 🏗️ Technical Architecture

```
[React Frontend]
     ↓
[Node.js Backend @8080] ↔ [Python AI Server @4000]
     ↓
[T5 Model → Generate MCQs, Summaries, Flashcards]
     ↓
[Store + Plan Based on Exam Dates]
     ↓
[Send Reminders → Update Scheduler → Feed Prediction Module]
```

### Tech Stack

| Component | Technology | Port |
|-----------|-----------|------|
| Frontend | React | 3000 |
| Backend | Node.js + Express | 8080 |
| AI Server | Python + Flask | 4000 |
| ML Model | Fine-tuned T5-base | - |
| File Upload | Multer | - |
| PDF Parsing | pdf-parse | - |

### Key Components

| Component | Role |
|-----------|------|
| `NotesUpload.jsx` | Handles upload UI and form submission |
| `routes/notes.js` | Manages file upload and text extraction |
| `ai/generator.js` | Calls Python AI server for MCQ generation |
| `ai_server/app.py` | Hosts fine-tuned T5 model locally |
| `parse_generated_text()` | Cleans output and extracts Q/A/options |
| In-memory storage | Stores notes, MCQs, user progress |

## 💡 Innovation Highlights

| Feature | Why It's Innovative |
|---------|-------------------|
| Fine-tuned T5 on custom dataset | Not a prompt hack — real ML training |
| No repeated questions | Used prompt variation + deduplication |
| Exam-aware scheduling | First local system linking AI-generated content to deadlines |
| Closed-loop feedback | Quiz results → prediction → rescheduling |
| Fully offline-capable | Runs without internet after setup |

> Unlike Google Gemini or ChatGPT wrappers, this is a domain-specific AI pipeline tailored for Sri Lankan university students.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start # Runs on port 8080
```

### AI Server Setup
```bash
cd ai_server
pip install -r requirements.txt
python app.py # Runs on port 4000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start # Runs on port 3000
```

## 🐛 Challenges Overcome

| Issue | Solution |
|-------|----------|
| Options broken across lines | Added `re.sub(r'\s+', ' ', text)` |
| Only one unique MCQ | Used chunking + sampling + diversity settings |
| 500 errors during upload | Added logs, fixed fs, re, CORS issues |
| Port conflicts | Aligned with team: backend on 8080, AI on 4000 |
| Model repeats same answer | Added deduplication logic |

## 🔮 Future Enhancements

- [ ] **OCR Support**: Use Tesseract.js to extract text from scanned PDFs
- [ ] **Auto-Summarization**: Add BART-based summarizer for one-page notes
- [ ] **Flashcard Export**: Export to Anki or Quizlet
- [ ] **Email Reminders**: Send scheduled practice links before exams
- [ ] **Progress Dashboard**: Show mastery over time per subject

## 📄 License

This project is part of the HelpMate academic system.

## 👥 Contributors

Built for Sri Lankan university students to revolutionize exam preparation through intelligent, adaptive learning.

---

**More than convenience, it offers confidence**: knowing exactly what to study, when to study it, and how well you're progressing.