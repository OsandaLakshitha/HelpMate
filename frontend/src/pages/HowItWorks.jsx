import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  Upload,
  Brain,
  Sparkles,
  FileText,
  Zap,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Heart,
  Target,
  TrendingUp,
  Shield,
  Users,
  Download,
  Play,
  Lightbulb,
} from 'lucide-react';




const HowItWorks = () => {




  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Steps data
  const steps = [
    {
      number: '01',
      title: 'Upload Your Content',
      description: 'Simply upload your lecture notes, PDFs, or study materials. Our AI accepts multiple formats.',
      icon: Upload,
      color: 'from-teal-500 to-cyan-500',
      features: ['PDF, DOCX, TXT support', 'Drag & drop interface', 'Bulk upload available', 'Cloud storage integration'],
      image: '📤',
    },
    {
      number: '02',
      title: 'AI Processing Magic',
      description: 'Our advanced AI analyzes your content, extracting key concepts and creating study materials.',
      icon: Brain,
      color: 'from-cyan-500 to-blue-500',
      features: ['Natural language processing', 'Concept extraction', 'Smart summarization', 'Pattern recognition'],
      image: '🧠',
    },
    {
      number: '03',
      title: 'Get Smart Materials',
      description: 'Receive flashcards, summaries, quizzes, and mind maps tailored to your learning style.',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      features: ['Auto-generated flashcards', 'Interactive quizzes', 'Visual mind maps', 'Personalized summaries'],
      image: '✨',
    },
    {
      number: '04',
      title: 'Track & Improve',
      description: 'Monitor your progress, identify weak areas, and get career recommendations.',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
      features: ['Progress analytics', 'Performance insights', 'Career matching', 'Personalized tips'],
      image: '📈',
    },
  ];

  // Parallax values
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">

      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
        {/* Parallax Background Elements */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute top-20 left-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y2, opacity }}
          className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y3, opacity }}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"
        />

        <motion.div
          style={{ scale }}
          className="relative z-10 text-center max-w-4xl mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm text-teal-100 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-teal-500/30"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Simple. Powerful. Effective.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            How HelpMate{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-cyan-100 mb-12"
          >
            Transform your study materials into success in just 4 simple steps
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center space-x-4"
          >
            <div className="animate-bounce">
              <ArrowRight className="w-6 h-6 text-teal-400 rotate-90" />
            </div>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 origin-left z-50"
          style={{ scaleX: smoothProgress }}
        />
      </section>

      {/* Sticky Steps Section */}
      <section className="relative">
        {steps.map((step, index) => (
          <StickyStep key={index} step={step} index={index} />
        ))}
      </section>

      {/* Interactive Feature Cards */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Three Powerful{' '}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to excel in your academic and professional journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Smart Study Tools"
              description="AI-powered flashcards, summaries, and quizzes"
              features={['Auto flashcards', 'Smart quizzes', 'Mind maps', 'Key concepts']}
              gradient="from-teal-500 to-cyan-500"
              delay={0}
            />
            <FeatureCard
              icon={Briefcase}
              title="Career Matching"
              description="Find your perfect job with AI recommendations"
              features={['CV analysis', 'Job matching', 'Skill gaps', 'Career paths']}
              gradient="from-cyan-500 to-blue-500"
              delay={0.2}
            />
            <FeatureCard
              icon={Heart}
              title="Mental Wellness"
              description="Manage stress and maintain balance"
              features={['Stress tracker', 'Meditation', 'Time management', 'Wellness tips']}
              gradient="from-emerald-500 to-teal-500"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Scrolling Text Reveal Section */}
      <ScrollTextReveal />

      {/* Timeline Section */}
      <TimelineSection />

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <Brain className="w-16 h-16 text-teal-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-cyan-100 mb-10">
            Join thousands of students already using HelpMate to achieve their goals
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white rounded-full font-semibold text-lg border-2 border-white hover:bg-white hover:text-teal-600 transition-all duration-300"
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

// Sticky Step Component
const StickyStep = ({ step, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-50% 0px -50% 0px' });

  return (
    <div ref={ref} className="min-h-screen flex items-center justify-center py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl mb-6 shadow-lg`}
            >
              <step.icon className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-8xl font-bold text-teal-100 mb-4"
            >
              {step.number}
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
            >
              {step.title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl text-slate-600 mb-8 leading-relaxed"
            >
              {step.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {step.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`${index % 2 === 1 ? 'lg:order-1' : ''} relative`}
          >
            <div className={`relative bg-gradient-to-br ${step.color} rounded-3xl p-12 shadow-2xl aspect-square flex items-center justify-center`}>
              <motion.div
                animate={isInView ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-9xl"
              >
                {step.image}
              </motion.div>

              {/* Floating particles */}
              {isInView && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -100 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -100 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -100 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white rounded-full"
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, features, gradient, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-6`}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>

      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>

      <div className="space-y-3">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4, delay: delay + 0.2 + idx * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
            <span className="text-sm text-slate-600">{feature}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Scroll Text Reveal Component
const ScrollTextReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20% 0px -20% 0px' });
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Smarter', 'Faster', 'Better', 'Easier'];

  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isInView, words.length]);

  return (
    <section ref={ref} className="py-32 bg-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          className="text-5xl md:text-7xl font-bold text-white mb-8"
        >
          Study{' '}
          <motion.span
            key={currentWord}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="inline-block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            {words[currentWord]}
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-300"
        >
          With HelpMate's AI-powered tools
        </motion.p>
      </div>
    </section>
  );
};

// Timeline Section
const TimelineSection = () => {
  const timelineData = [
    { time: '0 min', action: 'Upload notes', icon: Upload },
    { time: '2 min', action: 'AI processing', icon: Brain },
    { time: '5 min', action: 'Review materials', icon: FileText },
    { time: '10 min', action: 'Start studying', icon: Zap },
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-slate-50 to-teal-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            From Upload to{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Success
            </span>
          </h2>
          <p className="text-xl text-slate-600">In just 10 minutes</p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teal-500 to-cyan-500" />

          {timelineData.map((item, index) => (
            <TimelineItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TimelineItem = ({ item, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-6 h-6 text-teal-600" />
            <div>
              <div className="text-sm text-teal-600 font-semibold">{item.time}</div>
              <div className="text-lg font-bold text-slate-900">{item.action}</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-2/12 flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
          className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full border-4 border-white shadow-lg z-10"
        />
      </div>

      <div className="w-5/12" />
    </motion.div>
  );
};

export default HowItWorks;