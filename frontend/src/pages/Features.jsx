import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  BookOpen,
  Heart,
  Users,
  Upload,
  Sparkles,
  FileText,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Briefcase,
  Shield,
  Play,
  Download,
} from "lucide-react";

export default function Features() {
  const heroRef = useRef(null);
  const heroIn = useInView(heroRef, { once: true });

  const modules = [
    {
      icon: Brain,
      title: "Smart Learning Profiler",
      desc: "Your personal AI learning analyst that builds a unique profile based on behavior and performance.",
      color: "from-cyan-500 to-blue-500",
      bullets: [
        "Learns your study patterns",
        "Predicts performance trends",
        "Builds adaptive learning plans",
        "Understands weak & strong areas",
      ],
    },
    {
      icon: BookOpen,
      title: "AI Resource Recommender",
      desc: "Turns raw notes and lectures into digestible, structured study material in seconds.",
      color: "from-teal-500 to-cyan-500",
      bullets: [
        "Auto summaries & flashcards",
        "Instant MCQs from content",
        "Smart content ranking",
        "Bulk upload support",
      ],
    },
    {
      icon: Heart,
      title: "Academic Wellness Assistant",
      desc: "Tracks mood, stress, and energy to balance your workload and improve focus.",
      color: "from-emerald-500 to-teal-500",
      bullets: [
        "Mood journaling + Emotion analysis",
        "Study load balancing",
        "Healthy study habits",
        "Break reminders & nudges",
      ],
    },
    {
      icon: Users,
      title: "Community & Collaboration",
      desc: "Find peers, mentors, and group accountability through intelligent matching.",
      color: "from-blue-500 to-indigo-500",
      bullets: [
        "Study partner matching",
        "Group goals & progress",
        "Mentorship pipelines",
        "Career hint recommendations",
      ],
    },
  ];

  const mini = [
    { icon: FileText, title: "One-page summaries" },
    { icon: Upload, title: "Fast note processing" },
    { icon: Zap, title: "Quick AI actions" },
    { icon: TrendingUp, title: "Performance insights" },
    { icon: Briefcase, title: "Career mapping" },
    { icon: Shield, title: "Privacy-first design" },
    { icon: Download, title: "Export notes" },
    { icon: Play, title: "Guided study routines" },
  ];

  const timeline = [
    { time: "0 min", title: "Upload your notes", icon: Upload },
    { time: "2 min", title: "AI processes content", icon: Brain },
    { time: "5 min", title: "Your study pack is ready", icon: FileText },
    { time: "10 min", title: "Start your smart study", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative py-24 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/20 to-cyan-700/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroIn ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-sm text-teal-100">
                Next-gen student productivity
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              All Features of{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                HelpMate
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-cyan-100">
              Everything you need to study smarter: content generation,
              analytics, wellness, collaboration, personalization & automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {modules.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white mb-4`}
              >
                <m.icon className="w-7 h-7" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {m.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                {m.desc}
              </p>

              <ul className="mt-4 space-y-2">
                {m.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-200">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AUTO STUDY PACK SECTION */}
      <section className="py-24 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Auto-Generated Study Packs
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3">
              Upload any lecture or notes — HelpMate instantly converts it into
              clean, structured revision materials you can learn from.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <MiniItem icon={FileText} title="Smart summaries" />
              <MiniItem icon={BookOpen} title="Flashcards" />
              <MiniItem icon={Zap} title="MCQs" />
              <MiniItem icon={Upload} title="Bulk upload support" />
            </div>
          </motion.div>

          {/* RIGHT VISUAL BLOCK */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-700 dark:to-slate-800"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Everything processed in under a minute
            </h3>
            <ul className="space-y-3">
              <FeatureBullet text="AI extracts keywords" />
              <FeatureBullet text="Summaries generated from scratch" />
              <FeatureBullet text="Flashcards based on core concepts" />
              <FeatureBullet text="MCQs created with explanations" />
            </ul>
          </motion.div>
        </div>
      </section>

      {/* WELLNESS SECTION */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT BLOCK */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Wellness + Study Sync
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3">
              HelpMate adjusts workloads based on your mood and energy levels,
              helping you avoid burnout and maintain a stable study rhythm.
            </p>

            <ul className="space-y-3 mt-6">
              <FeatureBullet text="Mood journaling & emotion detection" />
              <FeatureBullet text="Break reminders" />
              <FeatureBullet text="Stress-aware scheduling" />
              <FeatureBullet text="Healthy study habits tracking" />
            </ul>
          </motion.div>

          {/* RIGHT MINI GRID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {mini.map((m, i) => (
              <MiniItem key={i} icon={m.icon} title={m.title} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          >
            From Upload to Study in Minutes
          </motion.h3>

          <div className="space-y-6">
            {timeline.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center">
                  <t.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-teal-600 font-semibold">{t.time}</p>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 text-white">
        <div className="text-center max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
              <Lightbulb className="w-5 h-5 text-amber-300" />
              <span className="text-sm text-teal-100">Ready to begin?</span>
            </div>

            <h2 className="text-4xl font-extrabold mb-4">
              Start Studying Smarter with HelpMate
            </h2>

            <p className="text-cyan-100/90 mb-8 text-lg">
              Upload your first note and let the AI build a complete study pack
              for you in minutes.
            </p>

            <button className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-full shadow hover:shadow-xl">
              Try It Free
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* --- REUSABLE MINI COMPONENTS --- */

function MiniItem({ icon: Icon, title }) {
  return (
    <div className="flex items-start gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-slate-900 dark:text-white font-medium">{title}</p>
    </div>
  );
}

function FeatureBullet({ text }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle className="w-5 h-5 text-teal-500" />
      <span className="text-slate-700 dark:text-slate-200">{text}</span>
    </li>
  );
}
