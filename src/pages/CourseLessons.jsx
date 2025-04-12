import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import "../styles/CourseLesson.css";
const CourseLessons = () => {
  const { user } = useContext(AuthContext);
  const { courseName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName); // ✅ Декодируем название курса

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  useEffect(() => {
    if (!user || !user.id) return;

    const fetchLessons = async () => {
      try {
        // const response = await API.get(`/lessons/${user.id}/${courseName}`);
        const response = await API.get(
          `/lessons/${user.id}/${decodedCourseName}`
        );

        setLessons(response.data.lessons);
        // 2. Получаем прогресс
        const progressRes = await API.get(
          `/lesson-progress/${user.id}/${decodedCourseName}`
        );

        setProgress(progressRes.data); // массив с полями: lessonName, repeats
      } catch (error) {
        console.error("Ошибка загрузки уроков:", error);
      }
    };

    fetchLessons();
  }, [user, decodedCourseName]);
  // Функция для получения количества повторений по уроку
  const getRepeatCount = (lessonName) => {
    const item = progress.find((p) => p.lessonName === lessonName);
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
      <h2 className="text-center">Уроки курса {courseName}</h2>
      {lessons.length === 0 ? (
        <p className="text-center mt-4">Нет доступных уроков.</p>
      ) : (
        <div className="row">
          {lessons.map((lesson, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm lesson-card">
                {/* Заливка фона */}
                <div
                  className="lesson-card-fill"
                  style={{ width: `${getRepeatPercentage(lesson)}%` }}
                ></div>

                {/* Контент поверх заливки */}
                <div className="lesson-card-content">
                  <h5 className="text-center">{lesson}</h5>
                  <Link
                    to={`/course/${encodeURIComponent(
                      courseName
                    )}/lesson/${encodeURIComponent(lesson)}`}
                    className="btn btn-outline-primary w-100 mt-2"
                  >
                    Открыть урок
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

export default CourseLessons;
