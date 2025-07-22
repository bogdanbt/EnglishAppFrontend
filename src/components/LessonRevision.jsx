

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import KnowledgeTypingGame from "./KnowledgeTypingGame";

const GAME_WORDS_KEY = "gameWordList";

const LessonRevision = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wordList, setWordList] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(GAME_WORDS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWordList(parsed);
        } else {
          navigate("/courses");
        }
      } catch {
        navigate("/courses");
      }
    } else {
      navigate("/courses");
    }
  }, [navigate]);

  const handleComplete = (updatedList) => {
    if (updatedList.length === 0) {
      localStorage.removeItem(GAME_WORDS_KEY);
      navigate("/courses");
    } else {
      localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(updatedList));
      setWordList(updatedList);
    }
  };

  const current = wordList[0];

  return (
    <div className="container mt-5">
      {current ? (
        <KnowledgeTypingGame
          word={current.word}
          translation={current.translation}
          example={current.example}
          userId={user.id}
          courseName={current.courseName}
          onComplete={() => handleComplete(wordList.slice(1))}
        />
      ) : (
        <p className="text-center">Загрузка...</p>
      )}
    </div>
  );
};

export default LessonRevision;
