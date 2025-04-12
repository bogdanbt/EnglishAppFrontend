import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PuzzleGameCore from "./PuzzleGameCore";
import TextGameCore from "./TextGameCore";
// import WordAssociations from "./WordAssociations";
import CONFIG from "../config";
import "./WordIntervalPuzzle.css";
import TranslationGame from "./TranslationGame";
const DailyGames = () => {
  const { lesson } = useParams();

  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentGameType, setCurrentGameType] = useState("text"); // "text", "association", "puzzle"
  const [isSecondRound, setIsSecondRound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch(
          `${CONFIG.API_URL}/api/words?lesson=${lesson}`
        );
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        setWordList(data);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке слов:", err);
        setError("Не удалось загрузить слова.");
        setLoading(false);
      }
    };

    fetchWords();
  }, [lesson]);

  const handleNextGame = () => {
    console.log("Переход к следующей игре");

    // Логика перехода к следующей игре
    if (isSecondRound) {
      // Если мы уже во втором раунде (PuzzleGameCore), просто перейдем к следующему слову
      const nextWordIndex = currentWordIndex + 1;

      if (nextWordIndex >= wordList.length) {
        // Если все слова пройдены во втором раунде, игра завершена
        setGameCompleted(true);
        console.log("🏁 Все слова пройдены!");
        return;
      }

      setCurrentWordIndex(nextWordIndex);
    } else {
      // Если мы в первом раунде (TextGameCore -> WordAssociations)
      if (currentGameType === "text") {
        // Переключаемся с TextGameCore на WordAssociations для того же слова
        setCurrentGameType("association");
      } else {
        // Переключаемся с WordAssociations на TextGameCore следующего слова
        const nextWordIndex = currentWordIndex + 1;

        if (nextWordIndex >= wordList.length) {
          // Если все слова пройдены в первом раунде, переходим ко второму раунду
          setIsSecondRound(true);
          setCurrentWordIndex(0);
        } else {
          // Иначе переходим к следующему слову
          setCurrentWordIndex(nextWordIndex);
          setCurrentGameType("text");
        }
      }
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (wordList.length === 0) return <p>Нет доступных слов для этого урока.</p>;
  if (gameCompleted)
    return <p>Поздравляем! Вы завершили изучение всех слов!</p>;

  const currentWord = wordList[currentWordIndex];

  if (!currentWord) {
    return <p>Произошла ошибка при загрузке слова.</p>;
  }

  // Логика отображения текущей игры
  if (isSecondRound) {
    console.log(
      "🎮 Второй раунд: PuzzleGameCore для слова:",
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
        "🎮 Первый раунд (1/2): TextGameCore для слова:",
        currentWord.word,
        `(${currentWordIndex + 1}/${wordList.length})`
      );

      return (
        <TextGameCore
          word={currentWord.word}
          occurrences={0} // Можно использовать для совместимости с предыдущим кодом
          onNext={handleNextGame}
        />
      );
    } else {
      console.log(
        "🎮 Первый раунд (2/2): WordAssociations для слова:",
        currentWord.word,
        `(${currentWordIndex + 1}/${wordList.length})`
      );

      return (
        <PuzzleGameCore
          wordData={currentWord}
          occurrences={2} // Можно использовать для совместимости с предыдущим кодом
          onNext={handleNextGame}
        />

        // <WordAssociations
        //   word={currentWord.word}
        //   email="bt.tarasenko@gmail.com"
        //   lesson={lesson}
        //   occurrences={1} // Можно использовать для совместимости с предыдущим кодом
        //   onNext={handleNextGame}
        // />
      );
    }
  }
};

export default DailyGames;
