const express = require('express');
const router = express.Router();
const { PricingTier, PricingConfig } = require('../models/Pricing');
const FAQ = require('../models/FAQ');
const { protect, adminOnly } = require('../middleware/auth');

// Helper function to check admin auth (since we might not have a full controller)
const authenticateAdmin = async (req, res, next) => {
  try {
    // Simple admin check - you can enhance this
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    const token = req.headers.authorization.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

// @route   GET /api/pricing
// @desc    Get all pricing data (tiers, config, FAQs)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tiers = await PricingTier.find({ isActive: true }).sort({ sortOrder: 1 });
    const config = await PricingConfig.findOne();
    const faqs = await FAQ.find({ isActive: true, category: 'pricing' }).sort({ sortOrder: 1 });

    res.json({
      success: true,
      data: {
        tiers,
        config: config || {
          comparisonTable: [],
          annualDiscount: 20,
          trialDays: 14,
          moneyBackDays: 30,
        },
        faqs,
      }
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/pricing/tiers
// @desc    Get all pricing tiers only
// @access  Public
router.get('/tiers', async (req, res) => {
  try {
    const tiers = await PricingTier.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, tiers });
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/pricing/tiers
// @desc    Create new pricing tier
// @access  Private (Admin only)
router.post('/tiers', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, monthlyPrice, annualPrice, gradient, popular, features, sortOrder } = req.body;

    if (!name || !description || monthlyPrice === undefined || annualPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingTier = await PricingTier.findOne({ name });
    if (existingTier) {
      return res.status(400).json({
        success: false,
        message: 'Pricing tier with this name already exists'
      });
    }

    if (popular) {
      await PricingTier.updateMany({}, { popular: false });
    }

    const newTier = new PricingTier({
      name,
      description,
      monthlyPrice,
      annualPrice,
      gradient: gradient || 'from-teal-500 to-cyan-500',
      popular: popular || false,
      features: features || [],
      sortOrder: sortOrder || 0,
    });

    await newTier.save();

    res.status(201).json({
      success: true,
      message: 'Pricing tier created successfully',
      tier: newTier
    });
  } catch (error) {
    console.error('Error creating pricing tier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/pricing/tiers/:id
// @desc    Update pricing tier
// @access  Private (Admin only)
router.put('/tiers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, monthlyPrice, annualPrice, gradient, popular, features, sortOrder, isActive } = req.body;

    const tier = await PricingTier.findById(req.params.id);

    if (!tier) {
      return res.status(404).json({ success: false, message: 'Pricing tier not found' });
    }

    if (popular && !tier.popular) {
      await PricingTier.updateMany({ _id: { $ne: req.params.id } }, { popular: false });
    }

    if (name !== undefined) tier.name = name;
    if (description !== undefined) tier.description = description;
    if (monthlyPrice !== undefined) tier.monthlyPrice = monthlyPrice;
    if (annualPrice !== undefined) tier.annualPrice = annualPrice;
    if (gradient !== undefined) tier.gradient = gradient;
    if (popular !== undefined) tier.popular = popular;
    if (features !== undefined) tier.features = features;
    if (sortOrder !== undefined) tier.sortOrder = sortOrder;
    if (isActive !== undefined) tier.isActive = isActive;

    await tier.save();

    res.json({
      success: true,
      message: 'Pricing tier updated successfully',
      tier
    });
  } catch (error) {
    console.error('Error updating pricing tier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/pricing/tiers/:id
// @desc    Delete pricing tier
// @access  Private (Admin only)
router.delete('/tiers/:id', authenticateAdmin, async (req, res) => {
  try {
    const tier = await PricingTier.findById(req.params.id);

    if (!tier) {
      return res.status(404).json({ success: false, message: 'Pricing tier not found' });
    }

    tier.isActive = false;
    await tier.save();

    res.json({
      success: true,
      message: 'Pricing tier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/pricing/config
// @desc    Get pricing config
// @access  Public
router.get('/config', async (req, res) => {
  try {
    let config = await PricingConfig.findOne();

    if (!config) {
      config = new PricingConfig({
        comparisonTable: [],
        annualDiscount: 20,
        trialDays: 14,
        moneyBackDays: 30,
      });
      await config.save();
    }

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/pricing/config
// @desc    Update pricing config
// @access  Private (Admin only)
router.put('/config', authenticateAdmin, async (req, res) => {
  try {
    const { comparisonTable, annualDiscount, trialDays, moneyBackDays } = req.body;

    let config = await PricingConfig.findOne();

    if (!config) {
      config = new PricingConfig(req.body);
    } else {
      if (comparisonTable !== undefined) config.comparisonTable = comparisonTable;
      if (annualDiscount !== undefined) config.annualDiscount = annualDiscount;
      if (trialDays !== undefined) config.trialDays = trialDays;
      if (moneyBackDays !== undefined) config.moneyBackDays = moneyBackDays;
    }

    await config.save();

    res.json({
      success: true,
      message: 'Config updated successfully',
      config
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/pricing/faqs
// @desc    Get pricing FAQs
// @access  Public
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true, category: 'pricing' }).sort({ sortOrder: 1 });
    res.json({ success: true, faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/pricing/faqs
// @desc    Create new FAQ
// @access  Private (Admin only)
router.post('/faqs', authenticateAdmin, async (req, res) => {
  try {
    const { question, answer, category, sortOrder } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const faq = new FAQ({
      question,
      answer,
      category: category || 'pricing',
      sortOrder: sortOrder || 0,
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/pricing/faqs/:id
// @desc    Update FAQ
// @access  Private (Admin only)
router.put('/faqs/:id', authenticateAdmin, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const { question, answer, category, sortOrder, isActive } = req.body;

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (sortOrder !== undefined) faq.sortOrder = sortOrder;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      faq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/pricing/faqs/:id
// @desc    Delete FAQ
// @access  Private (Admin only)
router.delete('/faqs/:id', authenticateAdmin, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    faq.isActive = false;
    await faq.save();

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;