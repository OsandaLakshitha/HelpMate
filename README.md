📘 Smart Academic Group Work Management System

The Smart Academic Group Work Management System is designed to make group projects fair, transparent, and efficient. It ensures that every member’s contribution is tracked, deadlines are respected, and supervisors can evaluate performance based on clear data.  
At its core, the system combines task lifecycle management, proof submission tracking, and contribution analytics to solve the problem of free‑riding and unfair grading in academic group work.


 🎯 The Problem
Students and supervisors often face challenges in group projects:
- Unequal contributions and free‑riding  
- Lack of transparency in task ownership and progress  
- Missed deadlines due to poor coordination  
- Difficulty for supervisors to fairly evaluate each member’s work  


✨ The Solution
The Smart Academic Group Work Management System solves these issues by:
- Providing task boards with strict status transitions (To Do → In Progress → Review → Completed)  
- Tracking proof submissions and activity logs for accountability  
- Offering dashboards that show workload distribution, completion rates, and last active times  
- Delivering fair contribution scoring normalized by project complexity and type  


🚀 Key Features

1. Project & Task Lifecycle
- Create projects and assign tasks by type (Coding, Documentation, Both, Other)  
- Status transitions enforced for clarity and accountability  
- Example: Task “Write API Docs” → moves from 'In Progress' → 'Review' → 'Completed'  

 2. Proof Submission Tracking
- Members upload proofs (documents, screenshots, links)  
- Weekly/monthly activity logs ensure consistent engagement  
- Example: “Proof of Code Commit” uploaded weekly → tracked in taskboard 

 3. Contribution Analytics
- Tracks tasks created, tasks completed, and time taken for transitions  
- Calculates fair contribution scores** using ML‑ready data models  
- Example: Member A completed 5 tasks on time → higher score than Member B with delays  

4. Deadline Management
- Each task has a start date, due date, and close date  
- System compares deadlines vs completion → marks OnTime, Late<15 days, Late<30 days  
- Example: Task due Jan 10, closed Jan 12 → marked Late<15 days  

5. Engagement Tracking
- Logs task views and dashboard visits  
- Engagement ratio = actions ÷ views  
- Example: Member viewed dashboard 10 times, submitted 3 proofs → ratio tracked  



🏗️ Technical Architecture

[React Frontend]
     ↓
[Node.js Backend @8080] ↔ [Python Analytics Server @4000]
     ↓
[MongoDB → Store Projects, Tasks, Proofs, Activity Logs]
     ↓
[Contribution Scoring Engine → ML-ready features]
     ↓
[Dashboard → Visualize workload, fairness, and progress]


⚙️ Tech Stack
| Component        | Technology        | Port |
|------------------|------------------|------|
| Frontend         | React + Material UI | 3000 |
| Backend          | Node.js + Express | 8080 |
| Analytics Server | Python + Flask    | 4000 |
| Database         | MongoDB           | -    |
| File Upload      | Multer            | -    |
| Proof Storage    | GridFS / Local    | -    |



🔑 Key Components
| Component            | Role |
|----------------------|------|
| ProjectBoard.jsx     | Displays tasks and status transitions |
| routes/tasks.js      | Manages task creation and updates |
| routes/proofs.js     | Handles proof uploads and validation |
| analytics/scoring.py | Calculates contribution scores |
| dashboard/Insights   | Shows workload, completion rate, last active |



💡 Innovation Highlights
| Feature | Why It’s Innovative |
|---------|----------------------|
| Strict status transitions | Prevents free‑riding and enforces accountability |
| Proof cadence tracking | Ensures regular activity, not just last‑minute work |
| Fair scoring model | Normalizes by project complexity and type |
| Supervisor dashboard | Provides transparent evaluation metrics |
| ML‑ready data models | Future‑proof for predictive analytics |

