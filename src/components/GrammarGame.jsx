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
        console.error("Error loading sentence:", error);
      }
    };

    fetchSentences();
  }, [user, decodedCourseName, decodedLessonName]);

  useEffect(() => {
    if (sentences.length === 0) return;

    const current = sentences[currentIndex];
    const base = current.sentenceGrammar.split(" ");
    const extra = current.extraWords || [];

    const allPieces = shuffleArray(
      [...base, ...extra].map((word, index) => ({ id: `${index}-${word}`, text: word }))
    );

    setPieces(allPieces);
    setSelected([]);
    setFeedback(null);
  }, [sentences, currentIndex]);

  const handleWordClick = (wordObj) => {
    if (selected.find((w) => w.id === wordObj.id)) return;
    const updated = [...selected, wordObj];
    setSelected(updated);

    const correctWords = sentences[currentIndex].sentenceGrammar.split(" ");
    if (updated.length === correctWords.length) {
      const isCorrect =
        updated.map((w) => w.text).join(" ") === sentences[currentIndex].sentenceGrammar;
      setFeedback(isCorrect ? "✅ Correct!" : "❌ Mistake!");

      if (isCorrect) {
        setTimeout(async () => {
          if (currentIndex + 1 >= sentences.length) {
            try {
              await API.patch("/grammar-progress/increment", {
                userId: user.id,
                courseGrammarName: decodedCourseName,
                lessonGrammarName: decodedLessonName,
              });
            } catch (err) {
              console.error("Restart error:", err);
            }

            navigate(`/grammar-course/${encodeURIComponent(courseGrammarName)}`);
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

    const allPieces = shuffleArray(
      [...base, ...extra].map((word, index) => ({ id: `${index}-${word}`, text: word }))
    );

    setPieces(allPieces);
    setSelected([]);
    setFeedback(null);
  };

  if (sentences.length === 0) return <p className="text-center">Loading...</p>;

  const current = sentences[currentIndex];

  return (
    <div className="container mt-5">
      <h4 className="text-center mb-4">Translation: {current.translation}</h4>

      <div className="d-flex flex-wrap justify-content-center mb-3">
        {pieces
          .filter((word) => !selected.find((w) => w.id === word.id))
          .map((word) => (
            <button
              key={word.id}
              className="btn btn-outline-primary m-1"
              onClick={() => handleWordClick(word)}
            >
              {word.text}
            </button>
          ))}
      </div>

      <div className="text-center mb-3">
        <strong>You answer:</strong> {selected.map((w) => w.text).join(" ")}
      </div>

      <div className="text-center">
        <button className="btn btn-warning me-2" onClick={resetSentence}>
          Restart
        </button>
      </div>

      {feedback && <p className="text-center mt-3 fw-bold">{feedback}</p>}
    </div>
  );
};

export default GrammarGame;
