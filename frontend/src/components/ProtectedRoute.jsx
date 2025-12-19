// This component now lets EVERYONE in.
const ProtectedRoute = ({ children }) => {
  return children; 
};

export default ProtectedRoute;







// src/components/ProtectedRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { motion } from 'framer-motion';

// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { user, loading, isAdmin } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/50">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full"
//         />
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (adminOnly && !isAdmin) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;