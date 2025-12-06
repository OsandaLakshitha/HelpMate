// src/pages/user/Settings.jsx
import React from 'react';
import { User, Bell, Shield, CreditCard } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <SettingSection icon={User} title="Account Settings" description="Manage your account details" />
        <SettingSection icon={Bell} title="Notifications" description="Configure your notification preferences" />
        <SettingSection icon={Shield} title="Privacy & Security" description="Manage your privacy settings" />
        <SettingSection icon={CreditCard} title="Billing" description="Manage your subscription and billing" />
      </div>
    </div>
  );
};

const SettingSection = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <button className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
        Manage
      </button>
    </div>
  </div>
);

export default Settings;