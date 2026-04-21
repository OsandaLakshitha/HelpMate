// frontend/src/features/masss/pages/ProfilePage.jsx

import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  const fields = [
    { label: 'First Name',    value: user?.firstName    },
    { label: 'Last Name',     value: user?.lastName     },
    { label: 'Email',         value: user?.email        },
    { label: 'University',    value: user?.university   },
    { label: 'Major',         value: user?.major        },
    { label: 'Academic Level',value: user?.academicLevel },
    { label: 'Plan',          value: user?.plan         },
  ].filter(f => f.value)

  return (
    <div className="bg-masss-white border border-masss-mint rounded-2xl p-6 max-w-lg">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-masss-mint">
        <div className="w-14 h-14 bg-masss-accent rounded-2xl flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
        <div>
          <p className="text-lg font-bold text-masss-heading">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-masss-accent">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.label}>
            <p className="text-xs font-semibold text-masss-heading/50 uppercase tracking-wider mb-1">
              {f.label}
            </p>
            <p className="text-sm text-masss-heading capitalize">{f.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-masss-mint">
        <p className="text-xs text-masss-heading/40">
          To update your profile details, visit{' '}
          <a href="/user/profile" className="text-masss-accent hover:underline">
            Helpmate Profile Settings
          </a>
        </p>
      </div>
    </div>
  )
}