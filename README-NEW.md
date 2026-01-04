# Content
- Overview
- The Problem
- The Solution
- System Modules
  - Intelligent Study Content Generation
  - Adaptive Student Task Scheduler using Reinforcement Learning
  - Smart Academic Group Work Management
  - Community & Collaboration Zone

## Overview


## The Problem
Undergraduate students face fragmented challenges: Academic Struggles (overwhelming content, exam anxiety), Collaboration Issues (free-riding in group work, unfair evaluation), and Inefficient Planning (static schedules that ignore fatigue). This leads to poor academic performance, stress, and a lack of career readiness

## The Solution
HelpMate is an all-in-one platform revolutionizing the academic experience through four integrated pillars.
- Personalized Study Planning (AI-driven content)
- Intelligent Task Scheduling (Reinforcement Learning)
- Fair Group Management (Contribution tracking)
- Career Guidance (Job matching)

## 1️⃣ Intelligent Study Content Generation Module

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

## 4️⃣ Community & Collaboration Zone
