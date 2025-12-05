// scripts/seedPricing.js
const mongoose = require('mongoose');
const { PricingTier, PricingConfig } = require('../models/Pricing');
const FAQ = require('../models/FAQ');
require('dotenv').config();

const tierData = [
  {
    name: 'Free',
    description: 'Perfect for trying out HelpMate',
    monthlyPrice: 0,
    annualPrice: 0,
    gradient: 'from-slate-500 to-slate-600',
    popular: false,
    sortOrder: 1,
    features: [
      { name: '5 AI summaries per month', icon: 'check' },
      { name: 'Basic flashcard generation', icon: 'check' },
      { name: '10 MB note storage', icon: 'check' },
      { name: 'CV analysis (1 per month)', icon: 'check' },
      { name: 'Basic job recommendations', icon: 'check' },
      { name: 'Stress tracking', icon: 'check' },
      { name: 'Email support', icon: 'check' },
    ],
  },
  {
    name: 'Pro',
    description: 'For serious students',
    monthlyPrice: 18,
    annualPrice: 115,
    gradient: 'from-teal-500 to-cyan-500',
    popular: true,
    sortOrder: 2,
    features: [
      { name: 'Unlimited AI summaries', icon: 'check' },
      { name: 'Advanced flashcards & quizzes', icon: 'check' },
      { name: '1 GB note storage', icon: 'check' },
      { name: 'Unlimited CV analyses', icon: 'check' },
      { name: 'Unlimited job recommendations', icon: 'check' },
      { name: 'Interview preparation tools', icon: 'check' },
      { name: 'Premium meditation guides', icon: 'check' },
      { name: 'Advanced analytics', icon: 'check' },
      { name: 'Priority support', icon: 'check' },
    ],
  },
  {
    name: 'Enterprise',
    description: 'For universities & organizations',
    monthlyPrice: 49,
    annualPrice: 470,
    gradient: 'from-purple-500 to-indigo-500',
    popular: false,
    sortOrder: 3,
    features: [
      { name: 'Everything in Pro', icon: 'check' },
      { name: 'Unlimited storage', icon: 'check' },
      { name: 'Custom AI training', icon: 'check' },
      { name: 'API access', icon: 'check' },
      { name: 'White-label options', icon: 'check' },
      { name: 'Dedicated account manager', icon: 'check' },
      { name: '1-on-1 counseling sessions', icon: 'check' },
      { name: 'Custom integrations', icon: 'check' },
      { name: 'SLA guarantee', icon: 'check' },
      { name: 'Advanced security & compliance', icon: 'check' },
    ],
  },
];

const configData = {
  comparisonTable: [
    {
      category: 'Study Tools',
      features: [
        { name: 'AI Flashcard Generation', free: true, pro: true, enterprise: true },
        { name: 'Smart Summaries', free: '5/month', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Note Upload Limit', free: '10 MB', pro: '1 GB', enterprise: 'Unlimited' },
        { name: 'Quiz Generation', free: false, pro: true, enterprise: true },
        { name: 'Advanced Analytics', free: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Career Tools',
      features: [
        { name: 'CV Analysis', free: true, pro: true, enterprise: true },
        { name: 'Job Recommendations', free: '10/month', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Interview Prep', free: false, pro: true, enterprise: true },
        { name: 'Skill Gap Analysis', free: false, pro: true, enterprise: true },
        { name: 'Career Path Planning', free: false, pro: false, enterprise: true },
      ],
    },
    {
      category: 'Wellness Features',
      features: [
        { name: 'Stress Tracking', free: true, pro: true, enterprise: true },
        { name: 'Meditation Guides', free: 'Basic', pro: 'Premium', enterprise: 'Premium+' },
        { name: 'Time Management', free: true, pro: true, enterprise: true },
        { name: 'Personalized Tips', free: false, pro: true, enterprise: true },
        { name: '1-on-1 Counseling', free: false, pro: false, enterprise: true },
      ],
    },
    {
      category: 'Support & Extras',
      features: [
        { name: 'Email Support', free: true, pro: true, enterprise: true },
        { name: 'Priority Support', free: false, pro: true, enterprise: true },
        { name: 'Dedicated Account Manager', free: false, pro: false, enterprise: true },
        { name: 'API Access', free: false, pro: false, enterprise: true },
        { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
      ],
    },
  ],
  annualDiscount: 20,
  trialDays: 14,
  moneyBackDays: 30,
};

const faqData = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.',
    category: 'pricing',
    sortOrder: 1,
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise plans, we also accept bank transfers and invoicing.',
    category: 'pricing',
    sortOrder: 2,
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.',
    category: 'pricing',
    sortOrder: 3,
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data is always safe. If you downgrade, you\'ll keep all your existing data, but some premium features may become read-only until you upgrade again.',
    category: 'pricing',
    sortOrder: 4,
  },
  {
    question: 'Do you offer student discounts?',
    answer: 'Yes! We offer a 20% discount for students with a valid .edu email address. The discount applies to all paid plans.',
    category: 'pricing',
    sortOrder: 5,
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us for a full refund within 30 days of purchase.',
    category: 'pricing',
    sortOrder: 6,
  },
];

const seedPricing = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await PricingTier.deleteMany({});
    await PricingConfig.deleteMany({});
    await FAQ.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert pricing tiers
    await PricingTier.insertMany(tierData);
    console.log('✅ Pricing tiers seeded');

    // Insert config
    await PricingConfig.create(configData);
    console.log('✅ Pricing config seeded');

    // Insert FAQs
    await FAQ.insertMany(faqData);
    console.log('✅ FAQs seeded');

    console.log('\n🎉 All pricing data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing:', error);
    process.exit(1);
  }
};

seedPricing();