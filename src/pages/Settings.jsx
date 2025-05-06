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
      setMessage("Error: User not found.");
      return;
    }

    setLoading(true);
    setMessage("Loading default content...");

    try {
      const response = await API.post(`${API.defaults.baseURL}/load-defaults`, {
        userId: user.id,
      });

      setMessage(response.data.message || "Default words loaded successfully.");

      setTimeout(() => {
        navigate("/courses");
      }, 1500);
    } catch (error) {
      console.error("Error loading default words:", error);
      setMessage(
        error.response?.data?.message || "An error occurred while loading."
      );
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5 text-center">
      <h2>Settings</h2>
      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={loadDefaultWords}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Default Words"}
        </button>
        {message && (
          <p className="mt-3 text-muted alert alert-info">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Settings;
