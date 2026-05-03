// backend/seeds/masss.seed.js
// Run: node backend/seeds/masss.seed.js

const mongoose = require('mongoose')

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
console.log('URI:', process.env.MONGODB_URI)
const { MasssProfile, MasssModule, MasssExam, MasssTask, MasssSession } = require('../models/masss')

const USER_ID = new mongoose.Types.ObjectId('693401e4a6e8dbe2ce61dc26')


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const sessionAt = (daysBack, hour) => {
  const d = daysAgo(daysBack)
  d.setHours(hour, 0, 0, 0)
  return d
}

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ Connected to MongoDB')

  // ── Wipe existing data for this user ──────────────────────────────────────
  await Promise.all([
    MasssProfile.deleteMany({ userId: USER_ID }),
    MasssModule.deleteMany({ userId: USER_ID }),
    MasssExam.deleteMany({ userId: USER_ID }),
    MasssTask.deleteMany({ userId: USER_ID }),
    MasssSession.deleteMany({ userId: USER_ID }),
  ])
  console.log('✓ Cleared existing MASSS data for user')

  // ── 1. Profile ─────────────────────────────────────────────────────────────
  await MasssProfile.create({
    userId:              USER_ID,
    chronotype:          'morning_bird',
    onboardingCompleted: true,
    slotPreferences: [
      {
        slotName:            'morning',
        slotLabel:           'Deep Work',
        startTime:           '07:00',
        endTime:             '11:00',
        maxPomodoros:        8,
        inferredEnergyScore: 0.85,
        isPreferred:         true,
      },
      {
        slotName:            'afternoon',
        slotLabel:           'Study Block',
        startTime:           '13:00',
        endTime:             '17:00',
        maxPomodoros:        6,
        inferredEnergyScore: 0.60,
        isPreferred:         false,
      },
      {
        slotName:            'evening',
        slotLabel:           'Night Review',
        startTime:           '19:00',
        endTime:             '22:00',
        maxPomodoros:        4,
        inferredEnergyScore: 0.45,
        isPreferred:         false,
      },
    ],
    weeklyRoutine: [
      { name: 'Algorithms Lecture',  activityType: 'class', dayOfWeek: 'monday',    startTime: '09:00', endTime: '11:00' },
      { name: 'Algorithms Lecture',  activityType: 'class', dayOfWeek: 'wednesday', startTime: '09:00', endTime: '11:00' },
      { name: 'Software Eng Lab',    activityType: 'class', dayOfWeek: 'tuesday',   startTime: '14:00', endTime: '16:00' },
      { name: 'Machine Learning',    activityType: 'class', dayOfWeek: 'thursday',  startTime: '10:00', endTime: '12:00' },
      { name: 'Gym',                 activityType: 'habit', dayOfWeek: 'monday',    startTime: '06:00', endTime: '07:00' },
      { name: 'Gym',                 activityType: 'habit', dayOfWeek: 'wednesday', startTime: '06:00', endTime: '07:00' },
      { name: 'Gym',                 activityType: 'habit', dayOfWeek: 'friday',    startTime: '06:00', endTime: '07:00' },
      { name: 'Part-time Work',      activityType: 'work',  dayOfWeek: 'saturday',  startTime: '10:00', endTime: '15:00' },
    ],
  })
  console.log('✓ Profile created')

  // ── 2. Modules ─────────────────────────────────────────────────────────────
  const [modAlgo, modSE, modML, modDB, modMath] = await MasssModule.insertMany([
    { userId: USER_ID, name: 'Algorithms & Data Structures', color: '#6366F1', category: 'coding',     energyTime: 'morning'   },
    { userId: USER_ID, name: 'Software Engineering',         color: '#0FA89E', category: 'coding',     energyTime: 'afternoon' },
    { userId: USER_ID, name: 'Machine Learning',             color: '#F59E0B', category: 'math_logic', energyTime: 'morning'   },
    { userId: USER_ID, name: 'Database Systems',             color: '#EF4444', category: 'coding',     energyTime: 'afternoon' },
    { userId: USER_ID, name: 'Discrete Mathematics',         color: '#8B5CF6', category: 'math_logic', energyTime: 'morning'   },
  ])
  console.log('✓ Modules created')

  // ── 3. Exams ───────────────────────────────────────────────────────────────
  const [examAlgoFinal, examAlgoMid, examSEProject, examMLAssign, examDBMid] = await MasssExam.insertMany([
    { userId: USER_ID, moduleId: modAlgo._id, name: 'Final Exam',              examType: 'final',      dueDate: daysFromNow(18), weight: 40, isCompleted: false },
    { userId: USER_ID, moduleId: modAlgo._id, name: 'Midterm',                 examType: 'midterm',    dueDate: daysAgo(10),     weight: 20, isCompleted: true  },
    { userId: USER_ID, moduleId: modSE._id,   name: 'Group Project Submission', examType: 'assignment', dueDate: daysFromNow(5),  weight: 30, isCompleted: false },
    { userId: USER_ID, moduleId: modML._id,   name: 'Assignment 2 — CNN',       examType: 'assignment', dueDate: daysFromNow(3),  weight: 15, isCompleted: false },
    { userId: USER_ID, moduleId: modDB._id,   name: 'Midterm Exam',             examType: 'midterm',    dueDate: daysFromNow(12), weight: 25, isCompleted: false },
  ])
  console.log('✓ Exams created')

  // ── 4. Tasks ───────────────────────────────────────────────────────────────
  const tasks = await MasssTask.insertMany([
    // Algorithms — urgent (final in 18 days)
    { userId: USER_ID, moduleId: modAlgo._id, examId: examAlgoFinal._id, name: 'Revise Dynamic Programming',         priority: 'high',   difficulty: 5, status: 'pending',     estimatedPomodoros: 6, sessionsCount: 0, deadline: daysFromNow(10) },
    { userId: USER_ID, moduleId: modAlgo._id, examId: examAlgoFinal._id, name: 'Practice Graph Algorithms',         priority: 'high',   difficulty: 4, status: 'in_progress', estimatedPomodoros: 4, sessionsCount: 2, deadline: daysFromNow(12) },
    { userId: USER_ID, moduleId: modAlgo._id, examId: examAlgoFinal._id, name: 'Review Sorting & Searching',        priority: 'medium', difficulty: 3, status: 'pending',     estimatedPomodoros: 3, sessionsCount: 0, deadline: daysFromNow(14) },
    { userId: USER_ID, moduleId: modAlgo._id, examId: null,              name: 'Solve 10 LeetCode Mediums',         priority: 'medium', difficulty: 4, status: 'pending',     estimatedPomodoros: 5, sessionsCount: 0, deadline: daysFromNow(20) },

    // Software Engineering — very urgent (project due in 5 days)
    { userId: USER_ID, moduleId: modSE._id, examId: examSEProject._id, name: 'Write Project Report',               priority: 'high',   difficulty: 3, status: 'in_progress', estimatedPomodoros: 4, sessionsCount: 1, deadline: daysFromNow(4)  },
    { userId: USER_ID, moduleId: modSE._id, examId: examSEProject._id, name: 'Fix REST API Bugs',                   priority: 'high',   difficulty: 4, status: 'pending',     estimatedPomodoros: 3, sessionsCount: 0, deadline: daysFromNow(3)  },
    { userId: USER_ID, moduleId: modSE._id, examId: examSEProject._id, name: 'Deploy to Staging Server',            priority: 'medium', difficulty: 2, status: 'pending',     estimatedPomodoros: 2, sessionsCount: 0, deadline: daysFromNow(5)  },
    { userId: USER_ID, moduleId: modSE._id, examId: null,              name: 'Review Design Patterns Chapter',     priority: 'low',    difficulty: 2, status: 'pending',     estimatedPomodoros: 2, sessionsCount: 0, deadline: null            },

    // Machine Learning — CNN assignment due in 3 days
    { userId: USER_ID, moduleId: modML._id, examId: examMLAssign._id, name: 'Implement CNN from Scratch',          priority: 'high',   difficulty: 5, status: 'in_progress', estimatedPomodoros: 8, sessionsCount: 3, deadline: daysFromNow(2)  },
    { userId: USER_ID, moduleId: modML._id, examId: examMLAssign._id, name: 'Write CNN Experiment Report',        priority: 'high',   difficulty: 3, status: 'pending',     estimatedPomodoros: 3, sessionsCount: 0, deadline: daysFromNow(3)  },
    { userId: USER_ID, moduleId: modML._id, examId: null,             name: 'Study Backpropagation Notes',         priority: 'medium', difficulty: 4, status: 'pending',     estimatedPomodoros: 3, sessionsCount: 0, deadline: daysFromNow(15) },

    // Database Systems
    { userId: USER_ID, moduleId: modDB._id, examId: examDBMid._id, name: 'Revise Normalisation (1NF–BCNF)',        priority: 'high',   difficulty: 3, status: 'pending',     estimatedPomodoros: 3, sessionsCount: 0, deadline: daysFromNow(8)  },
    { userId: USER_ID, moduleId: modDB._id, examId: examDBMid._id, name: 'Practice SQL Query Optimisation',       priority: 'medium', difficulty: 4, status: 'pending',     estimatedPomodoros: 4, sessionsCount: 0, deadline: daysFromNow(10) },
    { userId: USER_ID, moduleId: modDB._id, examId: null,          name: 'Read Indexing & B-Trees Chapter',       priority: 'low',    difficulty: 3, status: 'completed',   estimatedPomodoros: 2, sessionsCount: 2, deadline: null            },

    // Discrete Mathematics
    { userId: USER_ID, moduleId: modMath._id, examId: null, name: 'Revise Proof Techniques',                      priority: 'medium', difficulty: 4, status: 'pending',     estimatedPomodoros: 4, sessionsCount: 0, deadline: daysFromNow(25) },
    { userId: USER_ID, moduleId: modMath._id, examId: null, name: 'Graph Theory Problem Sets',                    priority: 'low',    difficulty: 3, status: 'pending',     estimatedPomodoros: 3, sessionsCount: 0, deadline: daysFromNow(28) },
  ])
  console.log(`✓ ${tasks.length} tasks created`)

  // ── 5. Sessions — 28 days of history ──────────────────────────────────────
  // Realistic pattern: good focus early in month, slight dip mid, recovery
  const cnnTask   = tasks.find(t => t.name === 'Implement CNN from Scratch')
  const graphTask = tasks.find(t => t.name === 'Practice Graph Algorithms')
  const seTask    = tasks.find(t => t.name === 'Write Project Report')
  const dbTask    = tasks.find(t => t.name === 'Read Indexing & B-Trees Chapter')
  const dpTask    = tasks.find(t => t.name === 'Revise Dynamic Programming')

  const sessionData = [
    // Week 4 ago — fresh, good ratings
    { task: dpTask,   daysBack: 27, hour: 8,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
    { task: dpTask,   daysBack: 27, hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: dbTask,   daysBack: 26, hour: 14, slot: 'afternoon', endType: 'completed', rating: 4, duration: 25 },
    { task: dpTask,   daysBack: 25, hour: 8,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
    { task: dbTask,   daysBack: 24, hour: 14, slot: 'afternoon', endType: 'completed', rating: 4, duration: 25 },
    { task: cnnTask,  daysBack: 23, hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: cnnTask,  daysBack: 22, hour: 8,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
    { task: cnnTask,  daysBack: 22, hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },

    // Week 3 ago — slight dip
    { task: graphTask, daysBack: 20, hour: 8,  slot: 'morning',   endType: 'completed', rating: 3, duration: 25 },
    { task: graphTask, daysBack: 20, hour: 14, slot: 'afternoon', endType: 'stopped',   rating: 2, duration: 15 },
    { task: cnnTask,   daysBack: 19, hour: 9,  slot: 'morning',   endType: 'completed', rating: 3, duration: 25 },
    { task: seTask,    daysBack: 18, hour: 14, slot: 'afternoon', endType: 'completed', rating: 3, duration: 25 },
    { task: seTask,    daysBack: 17, hour: 8,  slot: 'morning',   endType: 'aborted',   rating: 2, duration: 8  },
    { task: cnnTask,   daysBack: 16, hour: 9,  slot: 'morning',   endType: 'completed', rating: 3, duration: 25 },
    { task: graphTask, daysBack: 15, hour: 20, slot: 'evening',   endType: 'completed', rating: 2, duration: 25 },

    // Week 2 ago — recovering
    { task: cnnTask,   daysBack: 13, hour: 8,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: cnnTask,   daysBack: 13, hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: graphTask, daysBack: 12, hour: 8,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: seTask,    daysBack: 11, hour: 14, slot: 'afternoon', endType: 'completed', rating: 3, duration: 25 },
    { task: seTask,    daysBack: 10, hour: 14, slot: 'afternoon', endType: 'completed', rating: 4, duration: 25 },
    { task: cnnTask,   daysBack: 9,  hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: dbTask,    daysBack: 8,  hour: 14, slot: 'afternoon', endType: 'completed', rating: 5, duration: 25 },

    // This week — strong recovery
    { task: cnnTask,   daysBack: 6, hour: 8,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
    { task: cnnTask,   daysBack: 6, hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: graphTask, daysBack: 5, hour: 8,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
    { task: seTask,    daysBack: 4, hour: 14, slot: 'afternoon', endType: 'completed', rating: 4, duration: 25 },
    { task: seTask,    daysBack: 4, hour: 15, slot: 'afternoon', endType: 'completed', rating: 5, duration: 25 },
    { task: cnnTask,   daysBack: 3, hour: 9,  slot: 'morning',   endType: 'completed', rating: 4, duration: 25 },
    { task: graphTask, daysBack: 2, hour: 8,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
    { task: seTask,    daysBack: 1, hour: 14, slot: 'afternoon', endType: 'completed', rating: 4, duration: 25 },
    { task: seTask,    daysBack: 0, hour: 9,  slot: 'morning',   endType: 'completed', rating: 5, duration: 25 },
  ]

  const sessionsToInsert = sessionData.map(({ task, daysBack, hour, slot, endType, rating, duration }) => {
    const start = sessionAt(daysBack, hour)
    const end   = new Date(start.getTime() + duration * 60000)
    return {
      userId:          USER_ID,
      taskId:          task._id,
      startTime:       start,
      endTime:         end,
      durationMinutes: duration,
      slotType:        slot,
      endType,
      focusRating:     rating,
      isCompleted:     endType === 'completed',
    }
  })

  await MasssSession.insertMany(sessionsToInsert)
  console.log(`✓ ${sessionsToInsert.length} sessions created`)

  console.log('\n🎉 Seed complete! Summary:')
  console.log(`   Profile  : 1`)
  console.log(`   Modules  : 5`)
  console.log(`   Exams    : 5`)
  console.log(`   Tasks    : ${tasks.length}`)
  console.log(`   Sessions : ${sessionsToInsert.length}`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})