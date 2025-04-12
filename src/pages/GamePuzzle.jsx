import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import PuzzleGameCore from "../components/PuzzleGameCore";

const GamePuzzle = () => {
  const { user } = useContext(AuthContext);
  const { courseName, lessonName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedLessonName = decodeURIComponent(lessonName);

  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const [progressUpdated, setProgressUpdated] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchWords = async () => {
      try {
        const response = await API.get(
          `/words/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        setWords(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка загрузки слов:", error);
        setLoading(false);
      }
    };

    fetchWords();
  }, [user, decodedCourseName, decodedLessonName]);

  const handleNextWord = () => {
    const nextIndex = currentWordIndex + 1;

    if (nextIndex < words.length) {
      setCurrentWordIndex(nextIndex);
    } else {
      setGameFinished(true); // Урок завершён
    }
  };

  // 🔥 Обновляем прогресс, если игра завершена
  useEffect(() => {
    if (gameFinished && !progressUpdated) {
      const incrementProgress = async () => {
        try {
          await API.patch("/lesson-progress/increment", {
            userId: user.id,
            courseName: decodedCourseName,
            lessonName: decodedLessonName,
          });
          console.log("Прогресс по пазлам обновлён ✅");
          setProgressUpdated(true);
        } catch (error) {
          console.error("Ошибка при обновлении прогресса:", error);
        }
      };

      incrementProgress();
    }
  }, [
    gameFinished,
    progressUpdated,
    user.id,
    decodedCourseName,
    decodedLessonName,
  ]);

  if (loading) {
    return <p className="text-center mt-4">Загрузка...</p>;
  }

  return (
    <div className="container mt-5 text-center">
      <h2>Игра: Пазлы</h2>
      <h4>Урок: {decodedLessonName}</h4>

      {words.length === 0 ? (
        <p>В этом уроке пока нет слов.</p>
      ) : gameFinished ? (
        <div className="my-5">
          <h3 className="mb-3">🎉 Поздравляем! Вы прошли все слова! 🎉</h3>
          <Link
            to={`/course/${encodeURIComponent(courseName)}`}
            className="btn btn-success"
          >
            Назад к урокам
          </Link>
        </div>
      ) : (
        <PuzzleGameCore
          wordData={words[currentWordIndex]}
          onNext={handleNextWord}
        />
      )}
    </div>
  );
};

export default GamePuzzle;
