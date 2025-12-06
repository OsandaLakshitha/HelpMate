// src/pages/user/Profile.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, GraduationCap, BookOpen, Crown } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-slate-600 mb-4">{user?.email}</p>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              user?.plan === 'Free' ? 'bg-slate-100' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
            }`}>
              <Crown className={`w-4 h-4 ${user?.plan === 'Free' ? 'text-slate-600' : 'text-white'}`} />
              <span className={`font-semibold ${user?.plan === 'Free' ? 'text-slate-700' : 'text-white'}`}>
                {user?.plan} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={User} label="First Name" value={user?.firstName} />
            <InfoItem icon={User} label="Last Name" value={user?.lastName} />
            <InfoItem icon={Mail} label="Email" value={user?.email} />
            <InfoItem icon={GraduationCap} label="University" value={user?.university || 'Not set'} />
            <InfoItem icon={BookOpen} label="Major" value={user?.major || 'Not set'} />
            <InfoItem icon={Crown} label="Plan" value={user?.plan} />
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <label className="text-sm font-medium text-slate-600">{label}</label>
    </div>
    <p className="text-slate-900 font-medium">{value}</p>
  </div>
);

export default Profile;