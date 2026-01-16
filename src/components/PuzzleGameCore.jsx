import React, { useState, useEffect, useCallback } from "react";
import "./WordIntervalPuzzle.css";
import API from "../utils/api";

const PuzzleGameCore = ({ wordData, onNext }) => {
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [assembledWord, setAssembledWord] = useState([]);

  const initializeGame = useCallback(() => {
    if (!wordData) return;
    setShuffledLetters(wordData.word.split("").sort(() => Math.random() - 0.5));
    setAssembledWord([]);
  }, [wordData]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleLetterClick = (letter, index) => {
    setAssembledWord([...assembledWord, letter]);
    setShuffledLetters(shuffledLetters.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    initializeGame();
  };

  useEffect(() => {
    const isCorrect = assembledWord.join("") === wordData.word;
    if (!isCorrect) return;

    try {
      const playTts = async () => {
  const res = await API.get(`/speak/${encodeURIComponent(wordData.word)}`, {
    responseType: "blob",
  });

  const url = URL.createObjectURL(res.data);
  const audio = new Audio(url);

  audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });

  await audio.play();
};

playTts().catch((err) => {
  console.warn("audio error:", err);
});

    } catch (error) {
      console.warn("audioerror:", error);
    }

    const timer = setTimeout(() => {
      onNext();
    }, 1000);

    return () => clearTimeout(timer);
  }, [assembledWord, wordData, onNext]);
  return (
    <div className="game-content">
      <h1>Puzzle Game</h1>
      <p className="translation">
        Translate: <strong>{wordData.translation}</strong>
      </p>

      <div className="assembled-word">
        {assembledWord.map((letter, index) => (
          <span key={index} className="letter">
            {letter}
          </span>
        ))}
      </div>

      <div className="shuffled-letters">
        {shuffledLetters.map((letter, index) => (
          <button
            key={index}
            className="letter-button"
            onClick={() => handleLetterClick(letter, index)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="controls">
        <button className="reset-button" onClick={handleReset}>
          Restart
        </button>
      </div>

      {assembledWord.join("") === wordData.word && (
        <div className="success-message">
          <h2> 🎉🎉🎉🎉🎉</h2>
        </div>
      )}
    </div>
  );
};

export default PuzzleGameCore;
