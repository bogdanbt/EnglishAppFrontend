import React, { useState, useEffect, useCallback } from "react";
import "./WordIntervalPuzzle.css";

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
  // const playWord = async (word) => {
  //   try {
  //     const audio = new Audio(
  //       `http://localhost:5000/speak/${encodeURIComponent(word)}`
  //     );
  //     console.log(audio);
  //     audio.play();
  //     audio.onended = () => {
  //       onNext();
  //     };
  //   } catch (error) {
  //     console.error("error audio:", error);
  //     onNext();
  //   }
  // };

  useEffect(() => {
    const isCorrect = assembledWord.join("") === wordData.word;
    if (!isCorrect) return;

    try {
      const audio = new Audio(
        `http://localhost:5000/speak/${encodeURIComponent(wordData.word)}`
      );
      audio.play().catch((err) => {
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
