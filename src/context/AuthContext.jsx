import { createContext, useState, useEffect } from "react";
import API from "../utils/api";
import { jwtDecode } from "jwt-decode";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(null); // 🔥 Теперь null, а не false
  const [loading, setLoading] = useState(true); // Добавляем состояние загрузки

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          const decoded = jwtDecode(token);
          setUser({ id: decoded.userId });
          setIsAuth(true);
        } else {
          const { data } = await API.post("/auth/refresh"); // Пробуем refresh
          localStorage.setItem("accessToken", data.accessToken);
          const decoded = jwtDecode(data.accessToken);
          setUser({ id: decoded.userId });
          setIsAuth(true);
        }
      } catch {
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false); // 🔥 Ставим loading = false после завершения проверки
      }
    };

    checkAuth();
  }, []);

  const login = (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    setIsAuth(true);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.removeItem("accessToken");
      setIsAuth(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuth, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
