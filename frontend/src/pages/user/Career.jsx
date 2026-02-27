import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Target, TrendingUp } from 'lucide-react';

const Career = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Career Tools</h1>
        <p className="text-slate-600">Find your perfect job with AI-powered matching</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToolCard
          icon={FileText}
          title="CV Analysis"
          description="Get AI-powered feedback on your CV"
          gradient="from-teal-500 to-cyan-500"
        />
        <ToolCard
          icon={Briefcase}
          title="Job Matching"
          description="Find jobs that match your skills"
          gradient="from-blue-500 to-indigo-500"
        />
        <ToolCard
          icon={Target}
          title="Skill Gap Analysis"
          description="Identify skills to develop for your dream job"
          gradient="from-purple-500 to-pink-500"
        />
        <ToolCard
          icon={TrendingUp}
          title="Career Path"
          description="Plan your career trajectory"
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

export default Career;