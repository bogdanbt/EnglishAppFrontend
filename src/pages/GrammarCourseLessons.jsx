import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import "../styles/CourseLesson.css";

const GrammarCourseLessons = () => {
  const { user } = useContext(AuthContext);
  const { courseGrammarName } = useParams();
  const decodedCourseName = decodeURIComponent(courseGrammarName);

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchLessons = async () => {
      try {
        const response = await API.get(
          `/grammar-lessons/${user.id}/${decodedCourseName}`
        );
        setLessons(response.data.lessons);

        const progressRes = await API.get(
          `/grammar-progress/${user.id}/${decodedCourseName}`
        );
        setProgress(progressRes.data); // array: { lessonGrammarName, repeats }
      } catch (error) {
        console.error("Failed to load grammar lessons:", error);
      }
    };

    fetchLessons();
  }, [user, decodedCourseName]);

  const getRepeatCount = (lessonName) => {
    const item = progress.find((p) => p.lessonGrammarName === lessonName);
    return item ? item.repeats : 0;
  };

  const getRepeatPercentage = (lessonName) => {
    const count = getRepeatCount(lessonName);
    if (count <= 0) return 0;
    if (count >= 4) return 100;
    return (count / 4) * 100;
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">
        Lessons for Grammar Course: {decodedCourseName}
      </h2>

      {lessons.length === 0 ? (
        <p className="text-center mt-4">No grammar lessons available.</p>
      ) : (
        <div className="row">
          {lessons.map((lesson, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm lesson-card">
                <div
                  className="lesson-card-fill"
                  style={{ width: `${getRepeatPercentage(lesson)}%` }}
                ></div>

                <div className="lesson-card-content">
                  <h5 className="text-center">{lesson}</h5>
                  <Link
                    to={`/grammar-course/${encodeURIComponent(
                      courseGrammarName
                    )}/lesson/${encodeURIComponent(lesson)}`}
                    className="btn btn-outline-secondary w-100 mt-2"
                  >
                    Open Lesson
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarCourseLessons;
