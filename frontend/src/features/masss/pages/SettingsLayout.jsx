// frontend/src/features/masss/pages/SettingsLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
const SettingsLayout = () => (
  <div className="p-6 text-white">
    Settings
    <Outlet />
  </div>
)
export default SettingsLayout