import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Brain, FileText, CheckCircle } from 'lucide-react';

const Study = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Study Tools</h1>
        <p className="text-slate-600">Transform your notes with AI-powered study tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard
          icon={Upload}
          title="Upload Notes"
          description="Upload your study materials and let AI transform them"
          gradient="from-teal-500 to-cyan-500"
        />
        <ToolCard
          icon={Brain}
          title="Generate Flashcards"
          description="Auto-create flashcards from your notes"
          gradient="from-blue-500 to-indigo-500"
        />
        <ToolCard
          icon={FileText}
          title="Smart Summaries"
          description="Get AI-powered summaries of your documents"
          gradient="from-purple-500 to-pink-500"
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

export default Study;