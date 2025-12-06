// src/pages/admin/Settings.jsx
import React from 'react';
import { User, Shield, Database, Mail } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Settings</h1>
        <p className="text-slate-600">Manage system configuration</p>
      </div>

      <div className="space-y-6">
        <SettingSection icon={User} title="Admin Account" description="Manage admin account settings" />
        <SettingSection icon={Shield} title="Security" description="Configure security settings" />
        <SettingSection icon={Database} title="Database" description="Manage database configuration" />
        <SettingSection icon={Mail} title="Email Settings" description="Configure email notifications" />
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
        Configure
      </button>
    </div>
  </div>
);

export default AdminSettings;