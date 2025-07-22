

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MatchExamplePairsGame from "./MatchExamplePairsGame";
import API from "../utils/api";

const GAME_WORDS_KEY = "gameWordList";

const DailyGames = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wordList, setWordList] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(GAME_WORDS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // очистим на всякий случай перед началом
          localStorage.removeItem(GAME_WORDS_KEY);
          localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(parsed));
          setWordList(parsed);
        }
      } catch (err) {
        console.error("Ошибка при чтении gameWordList:", err);
      }
    }
  }, []);

  const handleWordComplete = async () => {
    const current = wordList[0];
    const remaining = wordList.slice(1);

    try {
      await API.post("/append-history", {
        userId: user.id,
        word: current.word,
        courseName: current.courseName,
        date: new Date().toISOString(),
        status: "intro",
      });
    } catch (error) {
      console.error("Ошибка при отправке истории:", error);
    }

    if (remaining.length === 0) {
      localStorage.removeItem(GAME_WORDS_KEY);
      navigate("/courses");
    } else {
      localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(remaining));
      setWordList(remaining);
    }
  };

  return (
    <div className="container mt-5 text-center">
      {wordList.length > 0 ? (
        <>
          <p className="text-muted mb-3">
            Осталось слов: {wordList.length}
          </p>
          <MatchExamplePairsGame
            word={wordList[0].word}
            onComplete={handleWordComplete}
          />
        </>
      ) : (
        <p>Загрузка слов...</p>
      )}
    </div>
  );
};

export default DailyGames;
