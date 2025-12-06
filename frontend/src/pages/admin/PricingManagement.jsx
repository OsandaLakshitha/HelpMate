import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import {
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Tag,
  Save,
  Zap,
  Crown,
  Building2,
} from 'lucide-react';

const PricingManagement = () => {
  const { token } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit'
  const [selectedTier, setSelectedTier] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [tiersRes, configRes] = await Promise.all([
        fetch(`${API_URL}/api/pricing/tiers`),
        fetch(`${API_URL}/api/pricing/config`),
      ]);

      const tiersData = await tiersRes.json();
      const configData = await configRes.json();

      if (tiersData.success) setTiers(tiersData.tiers);
      if (configData.success) setConfig(configData.config);
    } catch (err) {
      console.error('Error fetching pricing:', err);
      setError('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = () => {
    setSelectedTier(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditTier = (tier) => {
    setSelectedTier(tier);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteTier = async (tierId) => {
    if (!window.confirm('Are you sure you want to delete this pricing tier?')) return;

    try {
      const response = await fetch(`${API_URL}/api/pricing/tiers/${tierId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Pricing tier deleted successfully');
        fetchPricingData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete tier');
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/pricing/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Configuration updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update configuration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pricing Management</h1>
            <p className="text-slate-600">Manage pricing tiers and configuration</p>
          </div>
          <button
            onClick={handleCreateTier}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tier</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tiers.map((tier) => (
          <PricingTierCard
            key={tier._id}
            tier={tier}
            onEdit={handleEditTier}
            onDelete={handleDeleteTier}
          />
        ))}
      </div>

      {/* Configuration */}
      {config && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Global Configuration</h2>
          <form onSubmit={handleUpdateConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Annual Discount (%)
                </label>
                <input
                  type="number"
                  value={config.annualDiscount}
                  onChange={(e) => setConfig({ ...config, annualDiscount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trial Days
                </label>
                <input
                  type="number"
                  value={config.trialDays}
                  onChange={(e) => setConfig({ ...config, trialDays: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Money Back Days
                </label>
                <input
                  type="number"
                  value={config.moneyBackDays}
                  onChange={(e) => setConfig({ ...config, moneyBackDays: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal */}
      <TierModal
        show={showModal}
        type={modalType}
        tier={selectedTier}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchPricingData();
          setShowModal(false);
          setSuccess(`Tier ${modalType === 'create' ? 'created' : 'updated'} successfully`);
          setTimeout(() => setSuccess(''), 3000);
        }}
        token={token}
      />
    </div>
  );
};

// Pricing Tier Card
const PricingTierCard = ({ tier, onEdit, onDelete }) => {
  const getIcon = (name) => {
    switch (name) {
      case 'Free': return Zap;
      case 'Pro': return Crown;
      case 'Enterprise': return Building2;
      default: return Zap;
    }
  };

  const Icon = getIcon(tier.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-xl shadow-sm border-2 ${
        tier.popular ? 'border-teal-500' : 'border-slate-200'
      } p-6 hover:shadow-lg transition-all`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
            Popular
          </span>
        </div>
      )}

      <div className={`w-12 h-12 bg-gradient-to-r ${tier.gradient} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
      <p className="text-slate-600 text-sm mb-4">{tier.description}</p>

      <div className="mb-4">
        <div className="flex items-baseline mb-1">
          <span className="text-3xl font-bold text-slate-900">${tier.monthlyPrice}</span>
          <span className="text-slate-600 ml-2">/month</span>
        </div>
        <div className="text-sm text-slate-600">
          ${tier.annualPrice}/year
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-700 mb-2">{tier.features.length} Features</p>
        <div className="space-y-1">
          {tier.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600">
              <CheckCircle className="w-3 h-3 text-teal-600" />
              <span className="truncate">{feature.name}</span>
            </div>
          ))}
          {tier.features.length > 3 && (
            <p className="text-xs text-slate-500">+{tier.features.length - 3} more</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
        <button
          onClick={() => onEdit(tier)}
          className="flex-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center space-x-1"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(tier._id)}
          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </motion.div>
  );
};

// Tier Modal
const TierModal = ({ show, type, tier, onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    gradient: 'from-teal-500 to-cyan-500',
    popular: false,
    features: [],
    sortOrder: 0,
  });
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tier) {
      setFormData({
        name: tier.name,
        description: tier.description,
        monthlyPrice: tier.monthlyPrice,
        annualPrice: tier.annualPrice,
        gradient: tier.gradient,
        popular: tier.popular,
        features: tier.features,
        sortOrder: tier.sortOrder,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        monthlyPrice: 0,
        annualPrice: 0,
        gradient: 'from-teal-500 to-cyan-500',
        popular: false,
        features: [],
        sortOrder: 0,
      });
    }
  }, [tier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = type === 'create' 
        ? `${API_URL}/api/pricing/tiers`
        : `${API_URL}/api/pricing/tiers/${tier._id}`;

      const response = await fetch(url, {
        method: type === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save tier');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, { name: newFeature }],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              {type === 'create' ? 'Create' : 'Edit'} Pricing Tier
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tier Name
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select tier</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gradient
                </label>
                <select
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="from-slate-500 to-slate-600">Slate</option>
                  <option value="from-teal-500 to-cyan-500">Teal/Cyan</option>
                  <option value="from-purple-500 to-indigo-500">Purple/Indigo</option>
                  <option value="from-blue-500 to-cyan-500">Blue/Cyan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Monthly Price ($)
                </label>
                <input
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Annual Price ($)
                </label>
                <input
                  type="number"
                  value={formData.annualPrice}
                  onChange={(e) => setFormData({ ...formData, annualPrice: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Mark as Popular</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Features
              </label>
              <div className="space-y-2 mb-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-slate-50 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span className="flex-1 text-sm">{feature.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Add a feature..."
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : type === 'create' ? 'Create Tier' : 'Update Tier'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PricingManagement;