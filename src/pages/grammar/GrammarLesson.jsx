import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../utils/api";

const GrammarLesson = () => {
  const { user } = useContext(AuthContext);
  const { courseGrammarName, lessonGrammarName } = useParams();
  const decodedCourseName = decodeURIComponent(courseGrammarName);
  const decodedLessonName = decodeURIComponent(lessonGrammarName);
  const navigate = useNavigate();

  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sentences
  const fetchSentences = async () => {
    try {
      const response = await API.get(
        `/grammar/${user.id}/${decodedCourseName}/${decodedLessonName}`
      );
      setSentences(response.data);
    } catch (error) {
      console.error("Error loading grammar sentences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.id) return;
    fetchSentences();
  }, [user, decodedCourseName, decodedLessonName]);

  // Edit sentence
  const handleEdit = async (item) => {
    const newSentence = prompt("New English sentence:", item.sentenceGrammar);
    const newTranslation = prompt("New translation:", item.translation);
    if (newSentence && newTranslation) {
      try {
        await API.put(`/grammar/${item._id}`, {
          sentenceGrammar: newSentence,
          translation: newTranslation,
        });
        fetchSentences(); // update without reload
      } catch (err) {
        console.error("Edit error:", err);
      }
    }
  };

  // Reset progress
  const resetProgress = async () => {
    try {
      await API.put("/grammar-progress", {
        userId: user.id,
        courseGrammarName: decodedCourseName,
        lessonGrammarName: decodedLessonName,
        repeats: 0,
      });
      alert("Progress reset.");
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  // Delete lesson
  const deleteLesson = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete the entire lesson?"
    );
    if (!confirmed) return;
    try {
      await API.delete(
        `/grammar/${user.id}/${decodedCourseName}/${decodedLessonName}`
      );
      alert("Lesson deleted.");
      navigate(`/grammar-course/${courseGrammarName}`);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Lesson: {decodedLessonName}</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : sentences.length === 0 ? (
        <p className="text-center">No sentences in this lesson yet.</p>
      ) : (
        <>
          <div className="list-group mb-4">
            {sentences.map((item, index) => (
              <div key={index} className="custom-sentence-card">
                <div className="mb-2">
                  <strong>Translation:</strong> {item.translation}
                </div>
                <div className="text-muted mb-2">
                  <strong>Sentence:</strong> {item.sentenceGrammar}
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mb-3">
            <Link
              to={`/grammar-course/${encodeURIComponent(
                courseGrammarName
              )}/lesson/${encodeURIComponent(lessonGrammarName)}/game`}
              className="btn btn-success"
            >
              Start Game
            </Link>
          </div>

          <div className="text-center">
            <button
              className="btn btn-outline-danger me-2"
              onClick={resetProgress}
            >
              Reset Progress
            </button>
            <button className="btn btn-danger" onClick={deleteLesson}>
              Delete Entire Lesson
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GrammarLesson;
