import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../utils/api";
import "../../styles/CourseLesson.css";

const CourseLessons = () => {
  const { user } = useContext(AuthContext);
  const { courseName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName); // ✅ Decode course name

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const extractLessonNumber = (lessonTitle) => {
    const match = lessonTitle.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : Infinity;
  };

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchLessons = async () => {
      try {
        const response = await API.get(
          `/lessons/${user.id}/${decodedCourseName}`
        );
        //sort
        const sortedLessons = response.data.lessons.sort((a, b) => {
          return extractLessonNumber(a) - extractLessonNumber(b);
        });
        setLessons(sortedLessons);

        // 2. Get lesson progress
        const progressRes = await API.get(
          `/lesson-progress/${user.id}/${decodedCourseName}`
        );

        setProgress(progressRes.data); // array with: lessonName, repeats
      } catch (error) {
        console.error("Failed to load lessons:", error);
      }
    };

    fetchLessons();
  }, [user, decodedCourseName]);

  // Get repeat count for a lesson
  const getRepeatCount = (lessonName) => {
    const item = progress.find((p) => p.lessonName === lessonName);
    return item ? item.repeats : 0;
  };

  // Convert repeat count into percentage (0–100%)
  const getRepeatPercentage = (lessonName) => {
    const count = getRepeatCount(lessonName);
    if (count <= 0) return 0;
    if (count >= 4) return 100;
    return (count / 4) * 100;
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Lessons for course: {decodedCourseName}</h2>
      {lessons.length === 0 ? (
        <p className="text-center mt-4">No available lessons.</p>
      ) : (
        <div className="row">
          {lessons.map((lesson, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm lesson-card position-relative">
                {/* Кнопка удаления в углу */}
                <button
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                  onClick={async () => {
                    if (window.confirm(`Delete lesson "${lesson}"?`)) {
                      try {
                        await API.delete(
                          `/words/${user.id}/${decodedCourseName}/${lesson}`
                        );
                        setLessons(lessons.filter((l) => l !== lesson));
                      } catch (err) {
                        console.error("Error deleting lesson:", err);
                        alert("Failed to delete.");
                      }
                    }
                  }}
                >
                  ×
                </button>

                {/* Прогресс и кнопка перехода */}
                <div
                  className="lesson-card-fill"
                  style={{ width: `${getRepeatPercentage(lesson)}%` }}
                ></div>
                <div className="lesson-card-content">
                  <h5 className="text-center">{lesson}</h5>
                  <Link
                    to={`/course/${encodeURIComponent(
                      courseName
                    )}/lesson/${encodeURIComponent(lesson)}`}
                    className="btn btn-outline-primary w-100 mt-2"
                  >
                    Open Lesson
                  </Link>

                  {/* <button
                    className="btn btn-sm btn-success mt-2"
                    onClick={async () => {
                      try {
                        await API.patch("/lesson-progress/increment", {
                          userId: user.id,
                          courseName: decodedCourseName,
                          lessonName: lesson,
                        });
                        // Обновим локальный прогресс
                        const progressRes = await API.get(
                          `/lesson-progress/${user.id}/${decodedCourseName}`
                        );
                        setProgress(progressRes.data);
                      } catch (err) {
                        console.error("Ошибка при увеличении прогресса:", err);
                        alert("Не удалось обновить прогресс.");
                      }
                    }}
                  >
                    +1 к прогрессу
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseLessons;
