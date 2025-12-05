import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Heart,
  Target,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  Brain,
  BookOpen,
  Briefcase,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Clock,
  CheckCircle,
  Star,
  Rocket,
  Lightbulb,
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Mission & Vision */}
      <MissionVision />

      {/* Story Section */}
      <StorySection />

      {/* Values Section */}
      <ValuesSection />

      {/* Team Section */}
      <TeamSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Recognition */}
      <RecognitionSection />

      {/* CTA Section */}
      <AboutCTA />
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>About HelpMate</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Empowering Students to{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Achieve More
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed">
            We're on a mission to transform student life through AI-powered tools that make learning easier, career planning smarter, and wellness accessible.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-teal-500/50 transition-all duration-300"
              >
                <span className="flex items-center">
                  Join Us Today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Mission & Vision
const MissionVision = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const cards = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To democratize access to AI-powered educational tools that help students excel academically while maintaining their mental wellness and preparing for successful careers.',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'A world where every student has the resources, support, and technology they need to reach their full potential without sacrificing their wellbeing.',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
              <div className="relative bg-gradient-to-br from-white to-teal-50/30 rounded-3xl p-10 shadow-xl border border-slate-100">
                <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">{card.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Story Section
const StorySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-slate-50 to-teal-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4" />
              <span>Our Story</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Born from Student{' '}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Struggles
              </span>
            </h2>

            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                HelpMate was founded in 2024 by a group of students who experienced firsthand the challenges of balancing academic excellence, career preparation, and mental health.
              </p>
              <p>
                We noticed our peers struggling with the same issues: spending hours creating study materials, feeling lost about career paths, and dealing with overwhelming stress. We knew there had to be a better way.
              </p>
              <p>
                Combining our passion for education with cutting-edge AI technology, we built HelpMate—a comprehensive platform that addresses all these challenges in one place. What started as a simple note-taking tool has evolved into a complete student success ecosystem.
              </p>
              <p>
                Today, we're proud to serve over 50,000 students worldwide, helping them study smarter, find their dream careers, and maintain their wellbeing.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">50K+</div>
                  <div className="text-sm text-slate-600">Happy Students</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Values Section
const ValuesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const values = [
    {
      icon: Heart,
      title: 'Student-First',
      description: 'Every decision we make prioritizes student success and wellbeing above all else.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We constantly push boundaries with cutting-edge AI to solve real student problems.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is sacred. We use bank-level encryption to protect your information.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We foster a supportive environment where students help each other grow.',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Improvement',
      description: 'We listen to feedback and constantly evolve to better serve our users.',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Quality education tools should be accessible to students everywhere.',
      color: 'from-purple-500 to-violet-500',
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Our Core{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Values
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The principles that guide everything we do at HelpMate
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <value.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
              <p className="text-slate-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Team Section
const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const team = [
    {
      name: 'Osanda Chamikara',
      role: 'Content Intelligence Engineer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      bio: 'Former Stanford CS student passionate about EdTech',
      social: { linkedin: 'https://www.linkedin.com/in/osandalakshitha/', github: 'https://github.com/OsandaLakshitha', email: 'osandalakshitha01@gmail.com' },
    },
    {
      name: 'Shakya Ilukwaththage',
      role: 'Learning Systems Architect',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      bio: 'AI researcher with a focus on educational applications',
      social: { linkedin: '#', github: '#', email: '#' },
    },
    {
      name: 'Manuja Sandeep',
      role: 'Peer Network Engineer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      bio: 'Design thinking expert and former student wellness advocate',
      social: { linkedin: '#', github: '#', email: '#' },
    },
    {
      name: 'Bimasha Vishmi ',
      role: 'Wellness Systems Designer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      bio: 'Dedicated to helping students achieve their goals',
      social: { linkedin: '#', github: '#', email: '#' },
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-slate-50 to-teal-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Meet Our{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Passionate individuals dedicated to transforming student success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Image */}
                <div className="relative overflow-hidden aspect-square">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Social Links - Show on Hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors duration-200"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors duration-200"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors duration-200"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {member.social.email && (
                      <a
                        href={member.social.email}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors duration-200"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <div className="text-teal-600 font-medium mb-3">{member.role}</div>
                  <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { number: '50K+', label: 'Active Students', icon: Users, color: 'from-teal-500 to-cyan-500' },
    { number: '1M+', label: 'Notes Processed', icon: BookOpen, color: 'from-cyan-500 to-blue-500' },
    { number: '15K+', label: 'Job Matches', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { number: '98%', label: 'Satisfaction Rate', icon: Star, color: 'from-emerald-500 to-teal-500' },
    { number: '150+', label: 'Universities', icon: Globe, color: 'from-purple-500 to-pink-500' },
    { number: '24/7', label: 'AI Support', icon: Clock, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <section ref={ref} className="py-20 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Impact in{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Numbers
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
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
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4`}
              >
                <stat.icon className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Recognition Section
const RecognitionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const awards = [
    {
      icon: Award,
      title: 'Best EdTech Startup 2024',
      organization: 'TechCrunch Disrupt',
      year: '2024',
    },
    {
      icon: Rocket,
      title: 'Top 10 AI Innovation',
      organization: 'MIT Innovation Awards',
      year: '2024',
    },
    {
      icon: Star,
      title: 'Student Choice Award',
      organization: 'National Student Association',
      year: '2024',
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Recognition &{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Awards
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {awards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="group bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <award.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{award.title}</h3>
              <p className="text-teal-600 font-medium mb-1">{award.organization}</p>
              <p className="text-slate-500 text-sm">{award.year}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const AboutCTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

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
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Join Our Community?
        </h2>

        <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
          Be part of a growing community of students achieving more with HelpMate.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                Get Started Free
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
              Contact Us
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

// Helper component for Eye icon (not in lucide-react by default)
const Eye = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default About;