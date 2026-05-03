// pages/Pricing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Star,
  Shield,
  Users,
  Rocket,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/pricing`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch pricing data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setPricingData(result.data);
        } else {
          throw new Error(result.message || 'Failed to load pricing');
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!pricingData) {
    return <ErrorState error="No pricing data available" />;
  }

  return (
    <div className="min-h-screen">
      <PricingHero 
        billingCycle={billingCycle} 
        setBillingCycle={setBillingCycle}
        config={pricingData.config}
      />
      
      <PricingCards 
        tiers={pricingData.tiers} 
        billingCycle={billingCycle}
        config={pricingData.config}
      />
      
      {pricingData.config?.comparisonTable?.length > 0 && (
        <FeatureComparison comparisonTable={pricingData.config.comparisonTable} />
      )}
      
      {pricingData.faqs?.length > 0 && (
        <PricingFAQ faqs={pricingData.faqs} />
      )}
      
      <TrustSection />
      
      <PricingCTA config={pricingData.config} />
    </div>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/50">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto mb-4"
      />
      <p className="text-slate-600 font-medium">Loading pricing...</p>
    </div>
  </div>
);

// Error State
const ErrorState = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/50 px-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
      <p className="text-slate-600 mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Hero Section
const PricingHero = ({ billingCycle, setBillingCycle, config }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
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
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed">
            Start free and upgrade as you grow. All plans include our core AI features.
          </p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center space-x-4 bg-white rounded-full p-2 shadow-lg"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 relative ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                Save {config?.annualDiscount || 20}%
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Pricing Cards
const PricingCards = ({ tiers, billingCycle, config }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (!tiers || tiers.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((plan, index) => (
            <PricingCard
              key={plan._id}
              plan={plan}
              billingCycle={billingCycle}
              index={index}
              isInView={isInView}
              config={config}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Individual Pricing Card
const PricingCard = ({ plan, billingCycle, index, isInView, config }) => {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const isPopular = plan.popular;
  const isFree = plan.monthlyPrice === 0;

  const getIcon = (name) => {
    switch (name) {
      case 'Free':
        return Zap;
      case 'Pro':
        return Crown;
      case 'Enterprise':
        return Building2;
      default:
        return Zap;
    }
  };

  const Icon = getIcon(plan.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`relative ${isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
    >
      {isPopular && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-2">
            <Star className="w-4 h-4 fill-current" />
            <span>Most Popular</span>
          </div>
        </motion.div>
      )}

      <motion.div
        whileHover={{ y: -10 }}
        className={`relative h-full bg-gradient-to-br ${
          isPopular
            ? 'from-white via-teal-50/50 to-cyan-50/50 border-2 border-teal-500 shadow-2xl'
            : 'from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-xl'
        } rounded-3xl p-8 transition-all duration-300`}
      >
        {isPopular && (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-3xl pointer-events-none" />
        )}

        <div className="relative z-10">
          <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mb-6`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
          <p className="text-slate-600 mb-6">{plan.description}</p>

          <div className="mb-8">
            {isFree ? (
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600 ml-2">/month</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    ${price}
                  </span>
                  <span className="text-slate-600 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <div className="text-sm text-emerald-600 font-medium mt-2">
                    Save ${(plan.monthlyPrice * 12 - plan.annualPrice).toFixed(0)} per year
                  </div>
                )}
              </>
            )}
          </div>

          <Link to={isFree ? '/signup' : `/signup?plan=${plan.name.toLowerCase()}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-4 rounded-full font-semibold text-lg mb-8 transition-all duration-300 ${
                isPopular
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-xl'
                  : isFree
                  ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  : 'bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50'
              }`}
            >
              {isFree ? 'Start Free' : 'Get Started'}
            </motion.button>
          </Link>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 mb-4">What's included:</div>
            {plan.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.3 + idx * 0.05 }}
                className="flex items-start space-x-3"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-slate-700 text-sm leading-relaxed">{feature.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Feature Comparison
const FeatureComparison = ({ comparisonTable }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const renderFeatureValue = (value) => {
    if (value === true) {
      return <Check className="w-6 h-6 text-emerald-500 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-6 h-6 text-slate-300 mx-auto" />;
    }
    return <span className="text-slate-700 text-sm font-medium">{value}</span>;
  };

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
            Compare{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              All Features
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See exactly what's included in each plan
          </p>
        </motion.div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-teal-50 to-cyan-50">
                  <th className="text-left p-6 font-bold text-slate-900">Features</th>
                  <th className="text-center p-6 font-bold text-slate-900">Free</th>
                  <th className="text-center p-6 font-bold text-slate-900">Pro</th>
                  <th className="text-center p-6 font-bold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((category, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-slate-50">
                      <td colSpan="4" className="p-4 font-bold text-slate-900 text-lg">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featIdx) => (
                      <motion.tr
                        key={featIdx}
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.4, delay: catIdx * 0.1 + featIdx * 0.05 }}
                        className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200"
                      >
                        <td className="p-6 text-slate-700">{feature.name}</td>
                        <td className="p-6 text-center">{renderFeatureValue(feature.free)}</td>
                        <td className="p-6 text-center">{renderFeatureValue(feature.pro)}</td>
                        <td className="p-6 text-center">{renderFeatureValue(feature.enterprise)}</td>
                      </motion.tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className="lg:hidden space-y-4">
          {comparisonTable.map((category, catIdx) => (
            <ComparisonAccordion key={catIdx} category={category} isInView={isInView} index={catIdx} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Mobile Comparison Accordion
const ComparisonAccordion = ({ category, isInView, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />;
    }
    return <div className="text-slate-700 font-medium text-xs">{value}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-teal-50/50 transition-colors duration-200"
      >
        <span className="font-bold text-slate-900 text-lg">{category.category}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-teal-600" />
        </motion.div>
      </button>

      {isOpen && (
        <div className="p-6 pt-0 space-y-4">
          {category.features.map((feature, idx) => (
            <div key={idx} className="space-y-2">
              <div className="font-medium text-slate-900 text-sm">{feature.name}</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Free</div>
                  {renderValue(feature.free)}
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Pro</div>
                  {renderValue(feature.pro)}
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Enterprise</div>
                  {renderValue(feature.enterprise)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// FAQ Section
const PricingFAQ = ({ faqs }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-slate-600">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={faq._id} faq={faq} index={index} isInView={isInView} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 mb-4">Still have questions?</p>
          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Contact Support
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Item
const FAQItem = ({ faq, index, isInView }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg overflow-hidden border border-slate-100"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-start justify-between text-left hover:bg-teal-50/50 transition-colors duration-200"
      >
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-teal-600" />
          </div>
          <span className="font-semibold text-slate-900 text-lg pr-8">{faq.question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-6 h-6 text-teal-600" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pl-20">
          <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Trust Section
const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const trustBadges = [
    { icon: Shield, title: 'Secure Payments', description: 'Bank-level encryption' },
    { icon: Users, title: '50K+ Students', description: 'Trust HelpMate' },
    { icon: Star, title: '4.9/5 Rating', description: 'From 10K+ reviews' },
    { icon: TrendingUp, title: '98% Satisfaction', description: 'Customer happiness' },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-slate-50 to-teal-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <badge.icon className="w-8 h-8 text-teal-600" />
              </motion.div>
              <div className="font-bold text-slate-900 mb-1">{badge.title}</div>
              <div className="text-sm text-slate-600">{badge.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const PricingCTA = ({ config }) => {
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-8"
        >
          <Rocket className="w-20 h-20 text-teal-400" />
        </motion.div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>

        <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
          Join thousands of students who are already achieving more with HelpMate. Start your free trial today!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                Start Free Trial
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
              Talk to Sales
            </motion.button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-cyan-200 text-sm"
        >
          No credit card required • Cancel anytime • {config?.trialDays || 14}-day free trial
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Pricing;