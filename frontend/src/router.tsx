import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelector from "./pages/RoleSelector";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import PolicyLibrary from "./pages/PolicyLibrary";
import ManagerPortal from "./pages/ManagerPortal";

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<RoleSelector />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/policies" element={<PolicyLibrary />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/manager" element={<ManagerPortal />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

