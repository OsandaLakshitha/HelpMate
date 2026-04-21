// backend/models/masss/index.js
// Central export — import from here in all MASSS controllers

const MasssProfile = require('./Profile')
const MasssModule  = require('./Module')
const MasssExam    = require('./Exam')
const MasssTask    = require('./Task')
const MasssSession = require('./Session')

module.exports = {
  MasssProfile,
  MasssModule,
  MasssExam,
  MasssTask,
  MasssSession,
}