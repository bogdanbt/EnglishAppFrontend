import React, { useState, useEffect, useContext } from "react";
import API from "../utils/api";
import "../styles/MemoryGame.css";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

const MemoGameCore = () => {
  const { user } = useContext(AuthContext);
  const { courseName, lessonName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedLessonName = decodeURIComponent(lessonName);

  const [shuffledPairs, setShuffledPairs] = useState([]);
  const [flippedPairs, setFlippedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [progressUpdated, setProgressUpdated] = useState(false); // чтобы не вызывать дважды
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await API.get(
          `/words/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        const cardData = response.data;

        const preparedPairs = cardData.flatMap((card) => [
          {
            id: `${card._id}-word`,
            baseId: card._id,
            type: "word",
            value: card.word,
          },
          {
            id: `${card._id}-translation`,
            baseId: card._id,
            type: "translation",
            value: card.translation,
          },
        ]);

        setShuffledPairs(preparedPairs.sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Error fetching words for the game:", error);
      }
    };

    fetchWords();
  }, [user.id, decodedCourseName, decodedLessonName]);

  const handlePairClick = (card) => {
    if (matchedPairs.includes(card.id) || flippedPairs.includes(card)) return;

    //  Озвучиваем, если это английское слово
    if (card.type === "word") {
      try {
        const audio = new Audio(
          `http://localhost:5000/speak/${encodeURIComponent(card.value)}`
        );
        audio.play().catch((err) => {
          console.warn("Не удалось проиграть аудио:", err);
        });
      } catch (error) {
        console.warn("Ошибка в Audio:", error);
      }
    }
    const newFlippedPairs = [...flippedPairs, card];
    setFlippedPairs(newFlippedPairs);

    if (newFlippedPairs.length === 2) {
      const [firstCard, secondCard] = newFlippedPairs;

      if (firstCard.baseId === secondCard.baseId) {
        setMatchedPairs((prev) => [...prev, firstCard.id, secondCard.id]);

        setTimeout(() => {
          setFlippedPairs([]);
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedPairs([]);
        }, 1000);
      }
    } else if (newFlippedPairs.length > 2) {
      setFlippedPairs([]);
    }
  };
  // 🔥 Обновляем прогресс после прохождения
  useEffect(() => {
    const allMatched =
      shuffledPairs.length > 0 && matchedPairs.length === shuffledPairs.length;

    if (allMatched && !progressUpdated) {
      const incrementProgress = async () => {
        try {
          await API.patch("/lesson-progress/increment", {
            userId: user.id,
            courseName: decodedCourseName,
            lessonName: decodedLessonName,
          });
          console.log("Прогресс успешно обновлён 🎉");
          setProgressUpdated(true); // предотвращает повторный вызов
          setGameFinished(true); // ✅ показываем сообщение и кнопку
        } catch (error) {
          console.error("Ошибка при обновлении прогресса:", error);
        }
      };

      incrementProgress();
    }
  }, [
    matchedPairs,
    shuffledPairs,
    user.id,
    decodedCourseName,
    decodedLessonName,
    progressUpdated,
  ]);

  return (
    <div className="memory-game-container">
      <div className="d-flex flex-wrap justify-content-center align-items-center my-5 gap-4">
        <Link
          to="../"
          className="btn btn-dark text-white rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "50px", height: "50px" }}
        >
          ←
        </Link>
        <h1>Memory Game: {decodedLessonName}</h1>
      </div>

      <div className="memory-grid">
        {shuffledPairs.map((card) => (
          <div
            key={card.id}
            className={`memory-card ${
              flippedPairs.includes(card) || matchedPairs.includes(card.id)
                ? "flipped"
                : ""
            }`}
            onClick={() => handlePairClick(card)}
          >
            <div className="memory-card-front">
              {flippedPairs.includes(card) || matchedPairs.includes(card.id)
                ? card.value
                : "❓"}
            </div>
            <div className="memory-card-back">❓</div>
          </div>
        ))}
      </div>
      {/* 🎉 Победа и кнопка назад */}
      {gameFinished && (
        <div className="text-center my-5">
          <h2 className="mb-3">🎉 Поздравляем! Урок пройден! 🎉</h2>
          <Link
            to={`/course/${encodeURIComponent(courseName)}`}
            className="btn btn-success"
          >
            Назад к урокам
          </Link>
        </div>
      )}
    </div>
  );
};

export default MemoGameCore;
