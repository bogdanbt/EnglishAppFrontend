import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../utils/api";
import Speak from "../../components/Speak";

const Lesson = () => {
  const { user } = useContext(AuthContext);
  const { courseName, lessonName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedLessonName = decodeURIComponent(lessonName);

  const [words, setWords] = useState([]);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchWords = async () => {
      try {
        const response = await API.get(
          `/words/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        setWords(response.data);
      } catch (error) {
        console.error("Error loading words:", error);
      }
    };

    fetchWords();
  }, [user, decodedCourseName, decodedLessonName]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Lesson: {decodedLessonName}</h2>

      {words && words.length === 0 ? (
        <p className="text-center mt-4">No words in this lesson yet.</p>
      ) : words ? (
        <>
          <div className="row">
            {words.map((wordObj, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card p-3 shadow-sm">
                  <h5 className="text-center">{wordObj.word}</h5>
                  <Speak word={wordObj.word} showButton />
                  <p className="text-center text-muted">
                    {wordObj.translation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons for games */}
          <div className="mt-4 text-center">
            {/* Uncomment to enable other games:
            <Link
              to={`/game-memo/course/${encodeURIComponent(
                courseName
              )}/lesson/${encodeURIComponent(lessonName)}`}
              className="btn btn-outline-primary me-3"
            >
              Game Memo
            </Link>
            <Link
              to={`/game-puzzle/course/${encodeURIComponent(
                courseName
              )}/lesson/${encodeURIComponent(lessonName)}`}
              className="btn btn-outline-secondary"
            >
              Game Puzzle
            </Link> */}
            <Link
              to={`/daily-games/course/${encodeURIComponent(
                courseName
              )}/lesson/${encodeURIComponent(lessonName)}`}
              className="btn btn-outline-success mt-3"
            >
              Start Daily Games
            </Link>
            <Link
              to={`/revision/course/${encodeURIComponent(
                courseName
              )}/lesson/${encodeURIComponent(lessonName)}`}
              className="btn btn-outline-warning mt-3"
            >
              Repeat Words from This Lesson
            </Link>
          </div>

          <div className="text-center">
            <button
              className="btn btn-outline-danger mt-3"
              onClick={async () => {
                try {
                  await API.put("/lesson-progress", {
                    userId: user.id,
                    courseName: decodedCourseName,
                    lessonName: decodedLessonName,
                    repeats: 0,
                  });
                  alert("Progress has been reset.");
                } catch (err) {
                  console.error("Error resetting progress:", err);
                }
              }}
            >
              Reset Progress
            </button>
            <div className="text-center">
              <button
                className="btn btn-danger mt-3"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this lesson and all its words?"
                    )
                  ) {
                    try {
                      await API.delete(
                        `/words/${user.id}/${decodedCourseName}/${decodedLessonName}`
                      );
                      alert("Lesson deleted.");
                      window.location.href = `/course/${encodeURIComponent(
                        decodedCourseName
                      )}`;
                    } catch (err) {
                      console.error("Error deleting lesson:", err);
                      alert("Failed to delete lesson.");
                    }
                  }
                }}
              >
                Delete Entire Lesson
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center mt-4">Loading...</p>
      )}
    </div>
  );
};

export default Lesson;
