import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/models";

export const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) => {
  const { isAuthenticated, isHydrating, user } = useAuthStore();

  // Still restoring session from token — wait before deciding
  if (isHydrating) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Role guard — only block if user is loaded and role doesn't match
  if (roles && user && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
