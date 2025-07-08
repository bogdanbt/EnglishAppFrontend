import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import TextGameCore from "./TextGameCore";
import Speak from "../components/Speak";
import MatchExamplePairsGame from "./MatchExamplePairsGame";

const DailyGames = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { courseName, lessonName } = useParams();

  const [wordList, setWordList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchWords = async () => {
      try {
        const response = await API.get(
          `/words/${user.id}/${decodeURIComponent(
            courseName
          )}/${decodeURIComponent(lessonName)}`
        );
        setWordList(response.data);
      } catch (err) {
        setError("Не удалось загрузить слова.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [user, courseName, lessonName]);

  const handleNextWord = async () => {
    if (currentIndex + 1 >= wordList.length) {
      try {
        await API.patch("/lesson-progress/increment", {
          userId: user.id,
          courseName: decodeURIComponent(courseName),
          lessonName: decodeURIComponent(lessonName),
        });
      } catch (err) {
        console.error("Ошибка сохранения прогресса:", err);
      }

      navigate(`/course/${courseName}`);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (wordList.length === 0) return <p>Нет слов для игры.</p>;

  return (
    <>
      <div className="mb-3">
        <div className="d-flex justify-content-between mb-1">
          <small>
            Word {currentIndex + 1} of {wordList.length}
          </small>
          <small>
            {Math.round(((currentIndex + 1) / wordList.length) * 100)}%
          </small>
        </div>
        <div className="progress">
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{
              width: `${((currentIndex + 1) / wordList.length) * 100}%`,
            }}
            aria-valuenow={currentIndex + 1}
            aria-valuemin="0"
            aria-valuemax={wordList.length}
          />
        </div>
      </div>
      <Speak word={wordList[currentIndex]?.word} showButton delay={100} />
      <MatchExamplePairsGame
        key={wordList[currentIndex]?.word}
        word={wordList[currentIndex]?.word}
        onComplete={handleNextWord}
      />

      {/* <TextGameCore
        key={wordList[currentIndex]?.word}
        word={wordList[currentIndex]?.word}
        onNext={handleNextWord}
      /> */}
    </>
  );
};

export default DailyGames;
