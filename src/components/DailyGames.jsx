import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import PuzzleGameCore from "./PuzzleGameCore";
import TextGameCore from "./TextGameCore";
// import WordAssociations from "./WordAssociations";
import "./WordIntervalPuzzle.css";
import TranslationGame from "./TranslationGame";

const DailyGames = () => {
  const { user } = useContext(AuthContext);
  const { courseName, lessonName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedLessonName = decodeURIComponent(lessonName);

  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentGameType, setCurrentGameType] = useState("text"); // "text", "association", "puzzle"
  const [isSecondRound, setIsSecondRound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchWords = async () => {
      try {
        const response = await API.get(
          `/words/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        setWordList(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading words:", err);
        setError("Failed to load words.");
        setLoading(false);
      }
    };

    fetchWords();
  }, [user, decodedCourseName, decodedLessonName]);

  const handleNextGame = () => {
    console.log("Proceeding to the next game");

    // Game switch logic
    if (isSecondRound) {
      // If we're in the second round (PuzzleGameCore), just go to the next word
      const nextWordIndex = currentWordIndex + 1;

      if (nextWordIndex >= wordList.length) {
        // If all words are done in the second round, the game is complete
        setGameCompleted(true);
        console.log("🏁 All words completed!");
        return;
      }

      setCurrentWordIndex(nextWordIndex);
    } else {
      // First round (TextGameCore -> WordAssociations)
      if (currentGameType === "text") {
        // Switch from TextGameCore to WordAssociations for the same word
        setCurrentGameType("association");
      } else {
        // Switch from WordAssociations to the next word's TextGameCore
        const nextWordIndex = currentWordIndex + 1;

        if (nextWordIndex >= wordList.length) {
          // All words finished in the first round, start second round
          setIsSecondRound(true);
          setCurrentWordIndex(0);
        } else {
          // Otherwise go to next word
          setCurrentWordIndex(nextWordIndex);
          setCurrentGameType("text");
        }
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (wordList.length === 0) return <p>No available words for this lesson.</p>;
  if (gameCompleted) return <p>Congratulations! You have completed all words!</p>;

  const currentWord = wordList[currentWordIndex];

  if (!currentWord) {
    return <p>An error occurred while loading the word.</p>;
  }

  // Game rendering logic
  if (isSecondRound) {
    console.log(
      "🎮 Round 2: PuzzleGameCore for word:",
      currentWord.word,
      `(${currentWordIndex + 1}/${wordList.length})`
    );

    return (
      <TranslationGame
        word={currentWord.word}
        translation={currentWord.translation}
        onNext={handleNextGame}
      />
    );
  } else {
    if (currentGameType === "text") {
      console.log(
        "🎮 Round 1 (1/2): TextGameCore for word:",
        currentWord.word,
        `(${currentWordIndex + 1}/${wordList.length})`
      );

      return (
        <TextGameCore
          word={currentWord.word}
          occurrences={0} // Compatibility value
          onNext={handleNextGame}
        />
      );
    } else {
      console.log(
        "🎮 Round 1 (2/2): WordAssociations for word:",
        currentWord.word,
        `(${currentWordIndex + 1}/${wordList.length})`
      );

      return (
        <PuzzleGameCore
          wordData={currentWord}
          occurrences={2} // Compatibility value
          onNext={handleNextGame}
        />

        // <WordAssociations
        //   word={currentWord.word}
        //   email="bt.tarasenko@gmail.com"
        //   lesson={lesson}
        //   occurrences={1}
        //   onNext={handleNextGame}
        // />
      );
    }
  }
};

export default DailyGames;
