# 🎓 HelpMate - AI-Powered Academic Companion

# Content
- Overview
- The Problem
- The Solution
- System Modules
  - Intelligent Study Content Generation
  - Adaptive Student Task Scheduler using Reinforcement Learning
  - Smart Academic Group Work Management
  - Community & Collaboration Zone

## 📋Overview


## 🔴 The Problem
Undergraduate students face fragmented challenges: Academic Struggles (overwhelming content, exam anxiety), Collaboration Issues (free-riding in group work, unfair evaluation), and Inefficient Planning (static schedules that ignore fatigue). This leads to poor academic performance, stress, and a lack of career readiness

## ✨ The Solution
HelpMate is an all-in-one platform revolutionizing the academic experience through four integrated pillars.
- Personalized Study Planning (AI-driven content)
- Intelligent Task Scheduling (Reinforcement Learning)
- Fair Group Management (Contribution tracking)
- Career Guidance (Job matching)

## 1️⃣ Intelligent Study Content Generation Module

<div align="center">
<img src="https://via.placeholder.com/700x300/FFF3E0/F57C00?text=AI-Powered+Content+Generation" alt="Content Generation" width="90%"/>
</div>

### 🎯 Purpose

Automatically transforms uploaded lecture materials into interactive learning assets—quizzes, flashcards, and summarized notes—while intelligently aligning delivery with exam deadlines.

### ✨ Key Features

#### 📄 **Lecture Note Upload & Processing**
- Upload PDFs via drag-and-drop interface
- Secure storage using **Multer**
- Text extraction with **pdf-parse**
- Automatic cleaning and segmentation

#### 🤖 **AI-Powered Generation** (Fine-tuned T5 Model)

<table>
<tr>
<td width="33%">

**📝 MCQ Generation**
```
Q: What is normalization?
A) Data encryption
B) Reducing redundancy ✓
C) Query optimization
D) Index creation
```

</td>
<td width="33%">

**🗂️ Flashcards**
```
Front: ACID Properties

Back: Atomicity, 
Consistency, Isolation, 
Durability
```

</td>
<td width="33%">

**📄 Summaries**
```
Abstractive summary 
using BART/T5:

"Database normalization 
eliminates redundancy 
through normal forms..."
```

</td>
</tr>
</table>

#### 📅 **Deadline-Based Adaptive Delivery**

| Time Until Exam | Strategy | Frequency |
|----------------|----------|-----------|
| **> 3 weeks** | Generate all content | Weekly reviews |
| **2–3 weeks** | Spaced repetition | Every 5 days |
| **1–2 weeks** | Focus weak areas | Every 2-3 days |
| **< 1 week** | Intensive revision | Daily drills |

#### 🎯 **Interactive Quiz Engine**
- Multiple-choice interface with instant feedback
- Score tracking and weak topic detection
- Performance data feeds into prediction models

<div align="center">
<img src="https://via.placeholder.com/650x300/C5CAE9/5C6BC0?text=Quiz+Interface+with+Analytics" alt="Quiz Interface" width="85%"/>
</div>

### 🔬 Technical Implementation

```javascript
// Content Generation Pipeline
Upload PDF → Extract Text → NLP Processing (T5/BERT) 
→ Generate MCQs/Flashcards/Summaries → Store → Schedule Delivery
→ Track Performance → Feed Prediction Engine
```

**Tech Stack:**
- **NLP Models:** Fine-tuned T5-base, BERT, BART
- **Backend:** Node.js, Express, Python Flask
- **Processing:** spaCy, Hugging Face Transformers

---


## 2️⃣ Adaptive Student Task Scheduler using Reinforcement Learning
An intelligent, personalized study planner that fights procrastination by learning your energy patterns

### 📖 Component Overview
Traditional to-do lists are static. They don't care if you are tired, overwhelmed, or biased against Math. This project is a **Next-Generation Student Scheduler** that uses **Reinforcement Learning (RL)** to dynamically generate daily study plans.

Unlike standard planners that use fixed rules, this system **learns from the student**. By tracking Pomodoro sessions, focus ratings, and completion rates, the RL agent discovers
- *Is this student a Morning person or a Night owl?*
- *Do they underestimate how long Coding assignments take?*
- *Are they too fatigued to handle a Difficulty-5 Physics task right now?*

The system features a **Hybrid Architecture** that runs a **Greedy Heuristic** baseline alongside a **PPO Agent**, allowing for direct performance comparison (The **Pepsi Challenge**)

### 🚩 Key Features

#### 1. AI Scheduler (RL Agent)
- Uses PPO reinforcement learning for personalized daily scheduling
- Adapts to fatigue and subject difficulty using recent focus data
- Learns subject-level strengths and weaknesses
- Avoids inefficient scheduling behaviors (reward hacking)

#### 2. The Heuristic Baseline
- Priority + deadline–based greedy algorithm
- Efficiently fills time slots based on user capacity
- Serves as a baseline for performance comparison to demonstrate the AI scheduler’s improvement (Pepsi Challenge)

### 🛠️ Tech Stack
- Backend: Python 3.9+, FastAPI, Uvicorn
- AI/ML: Stable Baselines3 (PPO), OpenAI Gym (Custom Environment), NumPy/PandasAI/ML


### 🏗️ Project Structure
```bash
rl_agent/
├── routers/
│   └── schedule.py             # API endpoints for scheduling requests
│
├── schemas/
│   └── schedule.py             # Data validation and Pydantic models
│
├── rl_engine/
│   ├── agent.py                # RL agent interaction logic
│   ├── analytics.py            # Performance logging and metrics
│   ├── config.py               # Hyperparameters and settings
│   ├── environment.py          # Simulation environment definition
│   ├── predictor.py            # Neural network architecture
│   ├── reward.py               # Reward calculation logic
│   └── state_builder.py        # Feature extraction and state prep
│
├── services/
│   ├── heuristic.py            # Rule-based baseline algorithm
│   └── scheduling.py           # Main scheduling orchestrator
│
├── reports/
│   └── report.txt              # Generated summary reports of scheduling tasks
│
├── scripts/
│   └── test_comparision.py     # Script to compare RL vs. Heuristic performance
│
├── rl_models/                  # Directory for saving trained model weights
└── rl_log/                     # Directory for training logs and history

```
### 📊 How to Test (The *Pepsi Challenge*)  
Once the server is running, you can compare the two scheduling strategie
#### **1. Get Heuristic Schedule**
```bash
  GET /api/schedule/heuristic
```


#### **3. Get AI Schedule**
```bash
GET /api/schedule/rl
```


## 3️⃣ Smart Academic Group Work Management System
<div align="center">
<img src="https://via.placeholder.com/700x300/E8F5E9/43A047?text=Fair+%26+Transparent+Group+Management" alt="Group Management" width="90%"/>
</div>

### 🎯 Purpose

Improve fairness and transparency in university group projects by tracking individual contributions, reducing free-riding, and supporting better academic evaluation.

### ✨ Key Features

#### 📝 **Project & Task Management**
- Create and manage group projects
- Assign tasks to members with deadlines
- Track completion status in real-time
- **Group leader dashboard** for coordination
- Student self-management tools

<div align="center">
<img src="https://via.placeholder.com/600x250/FFF9C4/F9A825?text=Task+Assignment+%26+Tracking+Dashboard" alt="Task Dashboard" width="80%"/>
</div>

#### 📊 **Contribution & Performance Tracking**
```
Metrics Tracked:
├── Number of tasks completed
├── Contribution percentage
├── Active time (project interactions)
├── Task complexity weighting
└── Participation frequency
```

#### 🔍 **Free-Riding Detection** (Rule-Based)

Identifies low participation using:
- **Active time** significantly below team average
- **Task completion count** outliers
- **Contribution percentage** thresholds
- Automated alerts for supervisors

#### 📈 **Analytics Dashboard**

<table>
<tr>
<td width="50%">

**Quick Overview Cards**
- 📊 Total open projects
- ✅ To-do tasks
- 🔄 Ongoing tasks
- 📅 Upcoming deadlines

</td>
<td width="50%">

**Visual Insights**
- 🥯 Donut charts for task distribution
- 📊 Line charts for daily activity
- 📈 Project-wise activity filters
- ⏰ Last active timestamps

</td>
</tr>
</table>

<div align="center">
<img src="https://via.placeholder.com/700x350/E1F5FE/0277BD?text=Contribution+Analytics+Dashboard" alt="Analytics Dashboard" width="90%"/>
</div>

#### 🤖 **ML-Based Contribution Scoring**

```python
# Research Component: Predictive Scoring
Model: Random Forest / Gradient Boosting
Features: [active_time, tasks_completed, complexity_score, 
          interaction_frequency, commit_history]
Output: Contribution Score (0-100)
Training: FastAPI + Google Colab
```

- **Training separate from main system**
- Predictions used for scoring only (not decision-making)
- Frontend displays predicted contribution scores
- Helps supervisors make informed evaluations

### 🔬 Technical Implementation

**Backend:** Node.js, Express  
**ML Server:** Python FastAPI  
**Visualization:** Chart.js, D3.js  
**Database:** Firebase Firestore

---


## 4️⃣ Community & Collaboration Zone

<div align="center">
<img src="https://via.placeholder.com/700x300/FCE4EC/C2185B?text=Intelligent+Procrastination+Fighter" alt="RL Scheduler" width="90%"/>
</div>

### 🎯 Purpose

An intelligent, personalized study planner that fights procrastination by **learning your energy patterns** using Reinforcement Learning.

### 💡 The Innovation

> Traditional to-do lists are static. They don't care if you're tired, overwhelmed, or biased against Math.

This **Next-Generation Scheduler** uses RL to dynamically generate daily study plans by learning:
- 🌅 Are you a **morning person** or **night owl**?
- ⏱️ Do you **underestimate** coding assignment durations?
- 😴 Are you too **fatigued** for a Difficulty-5 Physics task right now?

### ✨ Key Features

#### 🤖 **PPO Reinforcement Learning Agent**

```python
State Space:
├── Current fatigue level (0-10)
├── Time of day (0-23)
├── Subject difficulty (1-5)
├── Recent focus ratings
├── Deadline urgency
└── Historical completion rates

Action Space:
├── Schedule task in time slot
├── Skip to next slot
└── Mark break time

Reward Function:
R = α(task_completion) + β(focus_quality) 
    - γ(deadline_penalty) - δ(fatigue_violation)
```

**Training Process:**
- Tracks **Pomodoro sessions** (25-min focus blocks)
- Records **focus ratings** after each session
- Learns **subject-level strengths/weaknesses**
- Adapts to **energy patterns** over time

<div align="center">
<img src="https://via.placeholder.com/650x300/DCEDC8/689F38?text=RL+Agent+Learning+Process" alt="RL Training" width="85%"/>
</div>

#### 📊 **The Pepsi Challenge: AI vs. Heuristic**

<table>
<tr>
<th>Method</th>
<th>Approach</th>
<th>Advantages</th>
<th>Limitations</th>
</tr>
<tr>
<td>🎯 <b>Heuristic Baseline</b></td>
<td>Priority + Deadline Greedy Algorithm</td>
<td>
• Fast execution<br>
• Predictable results<br>
• Easy to understand
</td>
<td>
• Rigid ordering<br>
• Ignores energy levels<br>
• No personalization
</td>
</tr>
<tr>
<td>🤖 <b>RL Agent</b></td>
<td>PPO-based Dynamic Scheduling</td>
<td>
• Adapts to fatigue<br>
• Learns preferences<br>
• Optimizes long-term productivity
</td>
<td>
• Requires training data<br>
• Computationally intensive<br>
• Black-box decisions
</td>
</tr>
</table>

#### 📡 **API Endpoints for Testing**

```bash
# Get Heuristic Schedule (Baseline)
GET /api/schedule/heuristic
# Result: Strict deadline ordering - efficient but rigid

# Get AI Schedule (RL Agent)
GET /api/schedule/rl
# Result: Dynamic ordering by priority + energy patterns
```

#### ⏰ **Smart Task Management**

- Tasks divided into **25-minute Pomodoro sessions**
- **In-progress tasks** stay prioritized (momentum maintenance)
- **Exam-linked tasks** get higher urgency
- Respects **sleep schedules** and **class timings**
- Avoids **reward hacking** through balanced objectives

<div align="center">
<img src="https://via.placeholder.com/600x350/B2DFDB/00796B?text=Pomodoro+Timer+%26+Focus+Tracking" alt="Pomodoro Interface" width="80%"/>
</div>

### 🔬 Technical Implementation

**RL Framework:** Stable-Baselines3 (PPO)  
**Backend:** Node.js, Express  
**Training:** Python, TensorFlow/PyTorch  
**State Management:** Redis for fast lookups  
**Deployment:** Separate microservice architecture

---

## 4️⃣ Community & Collaboration Zone

<div align="center">
<img src="https://via.placeholder.com/700x300/F3E5F5/7B1FA2?text=AI-Powered+Peer+Matching+%26+Career+Guidance" alt="Community Zone" width="90%"/>
</div>

### 🎯 Purpose

Facilitate peer collaboration, mentorship networks, and career development through intelligent matching algorithms and CV analysis.

### ✨ Key Features

#### 🤝 **Peer Matching via K-Means Clustering**

<div align="center">
<img src="https://via.placeholder.com/550x250/FFCCBC/E64A19?text=K-Means+Clustering+Visualization" alt="K-Means" width="75%"/>
</div>

**Mathematical Foundation:**

The algorithm minimizes **Within-Cluster Sum of Squares (WCSS)**:

```
WCSS = Σ(i=1 to k) Σ(x ∈ Ci) ||x - μi||²

where:
- k = number of clusters
- Ci = cluster i
- μi = centroid of cluster i
- x = student profile vector
```

**Implementation Process:**
1. **Data Vectorization:** Convert student profiles (interests, skills, goals) into numerical vectors
2. **Clustering:** Use `ml-kmeans` library to partition students into k groups
3. **Matching:** Assign students to clusters with nearest centroid
4. **Refinement:** Self-improving algorithm with reinforcement learning

**Features Considered:**
- Academic interests and specialization
- Programming language proficiency
- Project experience and skills
- Learning style preferences
- Availability and timezone

#### 🎓 **Mentorship Network**

- **Senior-Junior Pairing:** Connect experienced students with newcomers
- **Adaptive Pairing:** Dynamic adjustment based on interaction quality
- **Academic Guidance:** Domain expertise sharing
- **Skill Development:** Collaborative learning opportunities
- **Compatibility Ratings:** Feedback-driven refinement

<div align="center">
<img src="https://via.placeholder.com/600x300/C8E6C9/388E3C?text=Mentorship+Network+Graph" alt="Mentorship Network" width="80%"/>
</div>

#### 📄 **CV Analysis & Career Path Suggestions**

**PDF Extraction Pipeline:**
```javascript
Upload CV (PDF) → Extract Text (pdf-parse / pdfjs-dist)
→ Pattern Matching (Regex + NLP) → Identify Skills/Experience
→ Compare with Industry Standards → Generate Skill Gap Report
→ Suggest Certifications/Projects → Job API Integration
```

**Components:**

1️⃣ **Text Extraction**
```javascript
const pdfParse = require('pdf-parse');
// Extract raw text streams from PDF
const data = await pdfParse(cvBuffer);
const cvText = data.text;
```

2️⃣ **Pattern Matching & NLP**
```javascript
// Extract key sections using Regex
const skills = extractSection(cvText, /skills?:/i);
const experience = extractSection(cvText, /experience:/i);
const education = extractSection(cvText, /education:/i);
```

3️⃣ **Skill Gap Analysis**
```javascript
// Compare against industry requirements
const requiredSkills = getCareerRequirements(targetRole);
const missingSkills = requiredSkills.filter(
  skill => !skills.includes(skill)
);
```

4️⃣ **Job API Integration**
```javascript
// Asynchronous HTTPS requests to job platforms
const jobResults = await axios.get('https://api.linkedin.com/jobs', {
  params: { skills: extractedSkills, location: 'Sri Lanka' }
});
```

**Supported APIs:**
- 🔗 LinkedIn Jobs API
- 🌐 Indeed API
- 🎯 Adzuna API
- 📊 Glassdoor API

<div align="center">
<img src="https://via.placeholder.com/700x300/E8EAF6/3F51B5?text=CV+Analysis+%26+Skill+Gap+Report" alt="CV Analysis" width="90%"/>
</div>

#### 📊 **Career Analytics Engine**

- **Personalized Recommendations:** Based on current profile
- **Skill Gap Identification:** What's missing for target roles
- **Market Demand Analysis:** Trending skills in job market
- **Certification Suggestions:** Relevant courses and certifications
- **Predictive Modeling:** Career success probability estimation
- **Learning Path Generation:** Step-by-step skill development plan

#### 🎯 **Goal-Sharing Dashboards**

- Collaborative goal tracking among peers
- Progress visualization and milestones
- Motivational analytics and achievements
- Study group formation tools
- Project collaboration features

### 🔬 Technical Implementation

**Clustering:** `ml-kmeans` (Node.js ML library)  
**PDF Processing:** `pdf-parse`, `pdfjs-dist`  
**NLP:** Basic pattern matching + Regex  
**Job APIs:** `axios` for HTTP requests  
**File Upload:** `multer` middleware  
**Backend:** Node.js, Express

### 📦 Key Dependencies

| Library | Purpose |
|---------|---------|
| `express` | Web framework for API routing |
| `pdf-parse` | Extracting text from CVs |
| `ml-kmeans` | Clustering logic for peer matching |
| `axios` | API calls to job platforms |
| `multer` | Handling PDF uploads |
| `natural` | NLP utilities |
| `compromise` | Text parsing |

---
