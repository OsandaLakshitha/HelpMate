import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Heart,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  Brain,
  FileText,
  Target,
  Upload,
  Clock,
  Award,
  BarChart,
  Lightbulb,
  Rocket,
  Eye,
  MessageCircle,
  Play,
} from 'lucide-react';



const Home = () => {



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

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Study Tools',
      description: 'Transform your notes into flashcards, summaries, and interactive study materials using AI.',
      gradient: 'from-teal-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    },
    {
      icon: Briefcase,
      title: 'Career Matching',
      description: 'Upload your CV and get AI-powered job recommendations tailored to your skills and interests.',
      gradient: 'from-cyan-500 to-blue-500',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    },
    {
      icon: Heart,
      title: 'Mental Wellness',
      description: 'Manage stress with personalized wellness tips, meditation guides, and time management tools.',
      gradient: 'from-emerald-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Save Time',
      description: 'Automate note-taking and study prep',
      stat: '10hrs/week',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected',
      stat: '256-bit',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your learning journey',
      stat: '98% accuracy',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with fellow students',
      stat: '50K+ users',
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Students', icon: Users },
    { number: '1M+', label: 'Notes Processed', icon: FileText },
    { number: '98%', label: 'Satisfaction Rate', icon: Star },
    { number: '24/7', label: 'AI Support', icon: Clock },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      university: 'MIT',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      content: 'HelpMate transformed how I study. The flashcard feature is incredible and saved me hours of prep time!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Business Major',
      university: 'Stanford',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      content: 'The career matching tool helped me land my dream internship. The recommendations were spot-on!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Engineering Student',
      university: 'Berkeley',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      content: 'Managing stress during finals was so much easier with HelpMate. The wellness features are a game-changer.',
      rating: 5,
    },
  ];

  // Parallax values
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 origin-left z-50"
        style={{ scaleX: smoothProgress }}
      />

      {/* Hero Section with Advanced Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: y1, opacity: opacity1 }}
            className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          />
          <motion.div
            style={{ y: y2, opacity: opacity1 }}
            className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          />
          <motion.div
            style={{ y: y3, opacity: opacity1 }}
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Student Assistant</span>
            </motion.div>

            {/* Main Heading with Word Animation */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
            >
              <AnimatedText text="Study Smarter," delay={0.3} />
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                <AnimatedText text="Live Better" delay={0.5} />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed"
            >
              Transform your notes into smart study materials, discover perfect job matches, and take care of your mental health—all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-teal-500/50 transition-all duration-300"
                >
                  <span className="flex items-center justify-center">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group w-full sm:w-auto px-8 py-4 bg-white text-slate-800 rounded-full font-semibold text-lg border-2 border-slate-200 hover:border-teal-600 hover:text-teal-600 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </span>
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <HeroDashboard features={features} />
        </div>
      </section>

      {/* Animated Stats Section */}
      <AnimatedStats stats={stats} />

      {/* Features with Scroll Reveal */}
      <FeaturesSection features={features} />

      {/* Benefits Grid */}
      <BenefitsSection benefits={benefits} />

      {/* Interactive Feature Showcase */}
      <InteractiveShowcase />

      {/* Testimonials Carousel */}
      <TestimonialsSection testimonials={testimonials} />

      {/* How It Works Preview */}
      <HowItWorksPreview />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

// Animated Text Component
const AnimatedText = ({ text, delay = 0 }) => {
  const words = text.split(' ');
  
  return (
    <span>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + index * 0.1 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// Hero Dashboard Component
const HeroDashboard = ({ features }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative max-w-6xl mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-3xl opacity-20" />
      <div className="relative bg-white rounded-3xl shadow-2xl p-2 border border-slate-200">
        <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 rounded-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="p-8 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
                <div>
                  <div className="font-semibold text-slate-900">Welcome back!</div>
                  <div className="text-sm text-slate-600">Your AI study companion</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-600">Live</span>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Animated Stats Section
const AnimatedStats = ({ stats }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #14b8a6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors duration-300" />
              </motion.div>
              <CountUpNumber value={stat.number} isInView={isInView} delay={index * 0.1} />
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Count Up Number Component
const CountUpNumber = ({ value, isInView, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2"
    >
      {value}
    </motion.div>
  );
};

// Features Section with Parallax
const FeaturesSection = ({ features }) => {
  return (
    <section className="py-32 bg-gradient-to-br from-slate-50 to-teal-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful AI tools designed specifically for students who want to excel academically and professionally.
          </p>
        </motion.div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureShowcase key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Individual Feature Showcase
const FeatureShowcase = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-100px' });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative">
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className={`relative ${isEven ? '' : 'lg:col-start-2'}`}
        >
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={feature.image}
                alt={feature.title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              
              {/* Floating Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`absolute top-8 right-8 w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-xl`}
              >
                <feature.icon className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? 50 : -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}
        >
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.gradient} bg-opacity-10 text-teal-700 text-sm font-medium mb-6`}>
            <Sparkles className="w-4 h-4" />
            <span>Feature {index + 1}</span>
          </div>

          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {feature.title}
          </h3>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {feature.description}
          </p>

          <div className="space-y-4 mb-8">
            {['AI-powered analysis', 'Real-time updates', 'Personalized insights', 'Cross-platform sync'].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700">{item}</span>
              </motion.div>
            ))}
          </div>

          <Link to="/features">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`group px-8 py-4 bg-gradient-to-r ${feature.gradient} text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300`}
            >
              <span className="flex items-center">
                Learn More
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

// Benefits Section
const BenefitsSection = ({ benefits }) => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why Students{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Choose Us
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const BenefitCard = ({ benefit, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group bg-gradient-to-br from-white to-teal-50/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300"
      >
        <benefit.icon className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors duration-300" />
      </motion.div>
      
      <div className="text-3xl font-bold text-teal-600 mb-2">{benefit.stat}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{benefit.title}</h3>
      <p className="text-slate-600">{benefit.description}</p>
    </motion.div>
  );
};

// Interactive Showcase
const InteractiveShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const tabs = [
    {
      title: 'Upload Notes',
      icon: Upload,
      image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80',
      description: 'Simply drag and drop your study materials',
    },
    {
      title: 'AI Processing',
      icon: Brain,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      description: 'Our AI analyzes and extracts key concepts',
    },
    {
      title: 'Get Results',
      icon: Rocket,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      description: 'Receive personalized study materials instantly',
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-slate-900 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See It In{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Action
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Experience the power of AI-driven learning in three simple steps
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12 space-x-4">
          {tabs.map((tab, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveTab(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === index
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.title}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              {tabs[activeTab].title}
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              {tabs[activeTab].description}
            </p>
            <div className="space-y-4">
              {['Fast & Easy', 'Secure Process', 'Instant Results'].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                  <span className="text-slate-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            key={`image-${activeTab}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-20" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={tabs[activeTab].image}
                alt={tabs[activeTab].title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    {React.createElement(tabs[activeTab].icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div className="text-white font-semibold">
                    Step {activeTab + 1} of 3
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = ({ testimonials }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-teal-50 via-cyan-50/30 to-emerald-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Students Worldwide
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join thousands of students who are already achieving more with HelpMate
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial, index, isInView }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative"
    >
      {/* Quote Icon */}
      <div className="absolute top-8 right-8 text-6xl text-teal-100 font-serif">"</div>
      
      {/* Rating */}
      <div className="flex items-center space-x-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
          >
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <p className="text-slate-600 mb-6 leading-relaxed relative z-10">
        {testimonial.content}
      </p>

      {/* Author */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur opacity-50" />
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="relative w-14 h-14 rounded-full object-cover border-2 border-white"
          />
        </div>
        <div>
          <div className="font-semibold text-slate-900">{testimonial.name}</div>
          <div className="text-sm text-slate-500">{testimonial.role}</div>
          <div className="text-xs text-teal-600 font-medium">{testimonial.university}</div>
        </div>
      </div>
    </motion.div>
  );
};

// How It Works Preview
const HowItWorksPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4" />
              <span>Simple Process</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Get Started in{' '}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Minutes
              </span>
            </h2>

            <p className="text-xl text-slate-600 mb-8">
              Our intuitive platform makes it incredibly easy to transform your study experience.
            </p>

            <Link to="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center">
                  See How It Works
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="space-y-6">
              {[
                { step: 1, title: 'Upload Your Notes', icon: Upload, color: 'from-teal-500 to-cyan-500' },
                { step: 2, title: 'AI Processes Content', icon: Brain, color: 'from-cyan-500 to-blue-500' },
                { step: 3, title: 'Study Smarter', icon: Rocket, color: 'from-emerald-500 to-teal-500' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                  whileHover={{ x: 10 }}
                  className="flex items-center space-x-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-teal-600 font-semibold mb-1">Step {item.step}</div>
                    <div className="text-lg font-bold text-slate-900">{item.title}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-30"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-8"
        >
          <Brain className="w-20 h-20 text-teal-400" />
        </motion.div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Student Life?
        </h2>
        
        <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
          Join HelpMate today and experience the future of learning, career planning, and wellness.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
          </Link>
          
          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white rounded-full font-semibold text-lg border-2 border-white hover:bg-white hover:text-teal-600 transition-all duration-300"
            >
              Contact Sales
            </motion.button>
          </Link>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-cyan-200"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Bank-level Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Award Winning</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>50K+ Students</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Home;