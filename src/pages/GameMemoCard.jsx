import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../utils/api";
import "../styles/MemoryGame.css";
import { AuthContext } from "../context/AuthContext";

const MemoGameCore = () => {
  const { user } = useContext(AuthContext);
  const { courseName, lessonName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedLessonName = decodeURIComponent(lessonName);

  const [shuffledPairs, setShuffledPairs] = useState([]);
  const [flippedPairs, setFlippedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [progressUpdated, setProgressUpdated] = useState(false);
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

    // Play pronunciation if it's an English word
    if (card.type === "word") {
      try {
        const audio = new Audio(
          `http://localhost:5000/speak/${encodeURIComponent(card.value)}`
        );
        audio.play().catch((err) => {
          console.warn("Unable to play audio:", err);
        });
      } catch (error) {
        console.warn("Audio error:", error);
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

  // Update progress after finishing the game
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
          console.log("Progress updated successfully.");
          setProgressUpdated(true);
          setGameFinished(true);
        } catch (error) {
          console.error("Error updating progress:", error);
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
                : "?"}
            </div>
            <div className="memory-card-back">?</div>
          </div>
        ))}
      </div>

      {gameFinished && (
        <div className="text-center my-5">
          <h2 className="mb-3">Lesson completed!</h2>
          <Link
            to={`/course/${encodeURIComponent(courseName)}`}
            className="btn btn-success"
          >
            Back to lessons
          </Link>
        </div>
      )}
    </div>
  );
};

export default MemoGameCore;
