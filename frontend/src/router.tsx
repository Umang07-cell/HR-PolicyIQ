import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import PolicyLibrary from "./pages/PolicyLibrary";
import OnboardingTracker from "./pages/OnboardingTracker";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Scroll to top and trigger page animation on route change
function RouteChangeHandler() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  return null;
}

export const AppRouter = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <RouteChangeHandler />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/" element={<ProtectedRoute><OnboardingTracker /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/policies" element={<ProtectedRoute><PolicyLibrary /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
