import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Reusable route guard.
 * Receives the current userRole from App state (not localStorage)
 * so it stays reactive without needing an AuthContext.
 */
const ProtectedRoute = ({ children, userRole, allowedRoles = ['admin'] }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;