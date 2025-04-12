import React, { useEffect, useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const AddWord = () => {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");

  const [selectedLesson, setSelectedLesson] = useState("");
  const [customLesson, setCustomLesson] = useState("");

  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");

  const actualCourse = customCourse || selectedCourse;
  const actualLesson = customLesson || selectedLesson;

  useEffect(() => {
    if (!user?.id) return;

    const loadCourses = async () => {
      try {
        const res = await API.get(`/courses/${user.id}`);
        setCourses(res.data.courses);
      } catch (err) {
        console.error("Ошибка загрузки курсов", err);
      }
    };

    loadCourses();
  }, [user]);

  useEffect(() => {
    if (!user?.id || !actualCourse) return;

    const loadLessons = async () => {
      try {
        const res = await API.get(
          `/lessons/${user.id}/${encodeURIComponent(actualCourse)}`
        );
        setLessons(res.data.lessons);
      } catch (err) {
        console.error("Ошибка загрузки уроков", err);
      }
    };

    loadLessons();
  }, [actualCourse, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/words", {
        userId: user.id,
        courseName: actualCourse,
        lessonName: actualLesson,
        word,
        translation,
      });

      alert("Слово добавлено успешно!");

      setWord("");
      setTranslation("");
    } catch (err) {
      console.error("Ошибка при добавлении слова", err);
      alert("Ошибка при добавлении слова");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h3 className="mb-4">Добавить новое слово</h3>
      <form onSubmit={handleSubmit}>
        {/* Выбор или создание курса */}
        <div className="mb-3">
          <label className="form-label">Курс:</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCustomCourse("");
              setSelectedLesson("");
              setCustomLesson("");
            }}
            disabled={!!customCourse}
          >
            <option value="">-- Выбери курс --</option>
            {courses.map((course, i) => (
              <option key={i} value={course}>
                {course}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control mt-2"
            placeholder="или введи новый курс"
            value={customCourse}
            onChange={(e) => {
              setCustomCourse(e.target.value);
              setSelectedCourse("");
              setSelectedLesson("");
              setCustomLesson("");
            }}
          />
        </div>

        {/* Выбор или создание урока */}
        <div className="mb-3">
          <label className="form-label">Урок:</label>
          <select
            className="form-select"
            value={selectedLesson}
            onChange={(e) => {
              setSelectedLesson(e.target.value);
              setCustomLesson("");
            }}
            disabled={!!customLesson || !actualCourse}
          >
            <option value="">-- Выбери урок --</option>
            {lessons.map((lesson, i) => (
              <option key={i} value={lesson}>
                {lesson}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control mt-2"
            placeholder="или введи новый урок"
            value={customLesson}
            onChange={(e) => {
              setCustomLesson(e.target.value);
              setSelectedLesson("");
            }}
            disabled={!actualCourse}
          />
        </div>

        {/* Слово и перевод */}
        <div className="mb-3">
          <label className="form-label">Слово:</label>
          <input
            type="text"
            className="form-control"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Перевод:</label>
          <input
            type="text"
            className="form-control"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={!actualCourse || !actualLesson || !word || !translation}
        >
          Добавить слово
        </button>
      </form>
    </div>
  );
};

export default AddWord;
