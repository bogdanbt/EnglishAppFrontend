import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const GrammarGame = () => {
  const { user } = useContext(AuthContext);
  const { courseGrammarName, lessonGrammarName } = useParams();
  const decodedCourseName = decodeURIComponent(courseGrammarName);
  const decodedLessonName = decodeURIComponent(lessonGrammarName);
  const navigate = useNavigate();

  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pieces, setPieces] = useState([]);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchSentences = async () => {
      try {
        const response = await API.get(
          `/grammar/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        setSentences(response.data);
      } catch (error) {
        console.error("Ошибка загрузки предложений:", error);
      }
    };

    fetchSentences();
  }, [user, decodedCourseName, decodedLessonName]);

  useEffect(() => {
    if (sentences.length === 0) return;

    const current = sentences[currentIndex];
    const base = current.sentenceGrammar.split(" ");
    const extra = current.extraWords || [];
    const allPieces = shuffleArray([...base, ...extra]);

    setPieces(allPieces);
    setSelected([]);
    setFeedback(null);
  }, [sentences, currentIndex]);

  const handleWordClick = (word) => {
    if (selected.includes(word)) return;
    const updated = [...selected, word];
    setSelected(updated);

    // Автоматическая проверка
    const correctWords = sentences[currentIndex].sentenceGrammar.split(" ");
    if (updated.length === correctWords.length) {
      const isCorrect =
        updated.join(" ") === sentences[currentIndex].sentenceGrammar;
      setFeedback(isCorrect ? "✅ Верно!" : "❌ Ошибка!");

      if (isCorrect) {
        setTimeout(async () => {
          if (currentIndex + 1 >= sentences.length) {
            // ✅ Инкремент прогресса урока
            try {
              await API.patch("/grammar-progress/increment", {
                userId: user.id,
                courseGrammarName: decodedCourseName,
                lessonGrammarName: decodedLessonName,
              });
            } catch (err) {
              console.error("Ошибка при обновлении прогресса:", err);
            }

            navigate(
              `/grammar-course/${encodeURIComponent(courseGrammarName)}`
            );
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
        }, 1200);
      }
    }
  };

  const resetSentence = () => {
    const current = sentences[currentIndex];
    const base = current.sentenceGrammar.split(" ");
    const extra = current.extraWords || [];
    const allPieces = shuffleArray([...base, ...extra]);

    setPieces(allPieces);
    setSelected([]);
    setFeedback(null);
  };

  if (sentences.length === 0) return <p className="text-center">Загрузка...</p>;

  const current = sentences[currentIndex];

  return (
    <div className="container mt-5">
      <h4 className="text-center mb-4">Перевод: {current.translation}</h4>

      <div className="d-flex flex-wrap justify-content-center mb-3">
        {pieces
          .filter((word) => !selected.includes(word))
          .map((word, index) => (
            <button
              key={index}
              className="btn btn-outline-primary m-1"
              onClick={() => handleWordClick(word)}
            >
              {word}
            </button>
          ))}
      </div>

      <div className="text-center mb-3">
        <strong>Ваш ответ:</strong> {selected.join(" ")}
      </div>

      <div className="text-center">
        <button className="btn btn-warning me-2" onClick={resetSentence}>
          🔄 Начать заново
        </button>
      </div>

      {feedback && <p className="text-center mt-3 fw-bold">{feedback}</p>}
    </div>
  );
};

export default GrammarGame;
