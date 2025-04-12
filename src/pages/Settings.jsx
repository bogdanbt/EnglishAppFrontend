import React, { useContext, useState } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const loadDefaultWords = async () => {
    if (!user || !user.id) {
      setMessage("Ошибка: Пользователь не найден");
      return;
    }

    setLoading(true);
    setMessage("Загрузка...");

    try {
      // Используем полный путь к API
      const response = await API.post(`${API.defaults.baseURL}/load-defaults`, {
        userId: user.id,
      });

      setMessage(response.data.message);

      // ✅ Автообновление курсов после загрузки
      setTimeout(() => {
        navigate("/courses");
        // window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Ошибка при загрузке базовых слов:", error);
      setMessage(error.response?.data?.message || "Ошибка загрузки слов");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5 text-center">
      <h2>Настройки</h2>
      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={loadDefaultWords}
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Загрузить базовые слова"}
        </button>
        {message && (
          <p className="mt-3 text-muted alert alert-info">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Settings;
