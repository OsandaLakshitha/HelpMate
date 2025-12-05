const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'check',
  },
});

const comparisonFeatureSchema = new mongoose.Schema({
  name: String,
  free: mongoose.Schema.Types.Mixed, // Can be boolean, string, or number
  pro: mongoose.Schema.Types.Mixed,
  enterprise: mongoose.Schema.Types.Mixed,
});

const comparisonCategorySchema = new mongoose.Schema({
  category: String,
  features: [comparisonFeatureSchema],
});

const pricingTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Free', 'Pro', 'Enterprise'],
  },
  description: {
    type: String,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  annualPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  gradient: {
    type: String,
    default: 'from-teal-500 to-cyan-500',
  },
  popular: {
    type: Boolean,
    default: false,
  },
  features: [featureSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const pricingConfigSchema = new mongoose.Schema({
  comparisonTable: [comparisonCategorySchema],
  annualDiscount: {
    type: Number,
    default: 20,
  },
  trialDays: {
    type: Number,
    default: 14,
  },
  moneyBackDays: {
    type: Number,
    default: 30,
  },
}, {
  timestamps: true,
});

const PricingTier = mongoose.model('PricingTier', pricingTierSchema);
const PricingConfig = mongoose.model('PricingConfig', pricingConfigSchema);

module.exports = { PricingTier, PricingConfig };