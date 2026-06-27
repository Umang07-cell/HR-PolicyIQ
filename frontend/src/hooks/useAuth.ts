import { useAuthStore } from "../store/authStore";
import { login as apiLogin } from "../api/auth";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const { access_token, role, full_name, user_id } = res.data;
    setAuth({ id: user_id, email, full_name, role, is_active: true }, access_token);
    navigate("/");
  };

  const signOut = () => { logout(); navigate("/login"); };

  return { user, isAuthenticated, login, signOut };
};
