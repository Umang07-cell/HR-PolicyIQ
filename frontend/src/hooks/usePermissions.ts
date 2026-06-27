import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types/models";

export const usePermissions = () => {
  const { user } = useAuthStore();
  const role = user?.role as UserRole;
  return {
    isHRAdmin: role === "hr_admin",
    isManager: role === "manager" || role === "hr_admin",
    isExecutive: role === "executive",
    canUploadDocs: role === "hr_admin" || role === "executive",
    canApproveLeave: role === "manager" || role === "hr_admin",
    canViewPayroll: true,
    canViewAllGrievances: role === "hr_admin",
    role,
  };
};
