import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // 🔥 Показываем загрузку, пока идет проверка авторизации
  }

  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
