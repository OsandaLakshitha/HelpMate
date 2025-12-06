// src/pages/user/Wellness.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Moon, Coffee } from 'lucide-react';

const Wellness = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Wellness Center</h1>
        <p className="text-slate-600">Take care of your mental health and wellbeing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToolCard
          icon={Heart}
          title="Stress Tracker"
          description="Monitor and manage your stress levels"
          gradient="from-rose-500 to-pink-500"
        />
        <ToolCard
          icon={Activity}
          title="Mood Journal"
          description="Track your emotional wellbeing"
          gradient="from-blue-500 to-indigo-500"
        />
        <ToolCard
          icon={Moon}
          title="Sleep Tracker"
          description="Improve your sleep quality"
          gradient="from-purple-500 to-indigo-500"
        />
        <ToolCard
          icon={Coffee}
          title="Break Reminders"
          description="Stay productive with healthy breaks"
          gradient="from-emerald-500 to-teal-500"
        />
      </div>
    </div>
  );
};

const ToolCard = ({ icon: Icon, title, description, gradient }) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all"
  >
    <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600">{description}</p>
  </motion.div>
);

export default Wellness;