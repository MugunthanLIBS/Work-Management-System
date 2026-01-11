import React from 'react';
import ProtectedRoute from '../ProtectedRoute';
import DashboardLayout from './DashboardLayout';

const RoleLayout = ({ allowedRoles }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout />
    </ProtectedRoute>
  );
};

export default RoleLayout;
