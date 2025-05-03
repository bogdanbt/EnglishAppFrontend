import React, { useContext, useEffect, useState } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const VocabularyManualImport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [customLesson, setCustomLesson] = useState("");

  const [entries, setEntries] = useState([{ word: "", translation: "" }]);

  const fetchCourses = async () => {
    try {
      const res = await API.get(`/courses/${user.id}`);
      setCourses(res.data.courses);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    }
  };

  const fetchLessons = async (courseName) => {
    try {
      const res = await API.get(
        `/lessons/${user.id}/${encodeURIComponent(courseName)}`
      );
      setLessons(res.data.lessons);
    } catch (err) {
      console.error("Ошибка загрузки уроков:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse && !customCourse.trim()) {
      fetchLessons(selectedCourse);
    } else {
      setLessons([]);
    }
  }, [selectedCourse, customCourse]);

  const handleEntryChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addRow = () => {
    setEntries([...entries, { word: "", translation: "" }]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const finalCourse = customCourse.trim() || selectedCourse;
    const finalLesson = customLesson.trim() || selectedLesson;

    if (!finalCourse || !finalLesson) {
      alert("Укажите курс и урок!");
      return;
    }

    const prepared = entries
      .filter((e) => e.word.trim() && e.translation.trim())
      .map((entry) => ({
        userId: user.id,
        courseName: finalCourse,
        lessonName: finalLesson,
        word: entry.word,
        translation: entry.translation,
        repeats: 0,
      }));

    if (prepared.length === 0) {
      alert("Нет слов для импорта.");
      return;
    }

    try {
      const res = await API.post("/words", prepared);
      alert(`✅ Импортировано: ${res.data.inserted.length} слов`);
      setEntries([{ word: "", translation: "" }]);
    } catch (err) {
      console.error("Ошибка импорта:", err);
      alert("Ошибка при импорте");
    }
  };
  return (
    <div className="container mt-5">
      <h2>Ручной импорт слов</h2>
      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/import-vocabulary-extended")}
        >
          📦 Import (Extended)
        </button>
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <label>Выберите курс:</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCustomCourse("");
              setSelectedLesson("");
            }}
            disabled={customCourse.trim() !== ""}
          >
            <option value="">— выбрать курс —</option>
            {courses.map((course, i) => (
              <option key={i} value={course}>
                {course}
              </option>
            ))}
          </select>
          <input
            className="form-control mt-2"
            placeholder="или введите новый курс"
            value={customCourse}
            onChange={(e) => setCustomCourse(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label>Выберите урок:</label>
          <select
            className="form-select"
            value={selectedLesson}
            onChange={(e) => {
              setSelectedLesson(e.target.value);
              setCustomLesson("");
            }}
            disabled={
              customLesson.trim() !== "" ||
              (!selectedCourse && !customCourse.trim())
            }
          >
            <option value="">— выбрать урок —</option>
            {lessons.map((lesson, i) => (
              <option key={i} value={lesson}>
                {lesson}
              </option>
            ))}
          </select>
          <input
            className="form-control mt-2"
            placeholder="или введите новый урок"
            value={customLesson}
            onChange={(e) => setCustomLesson(e.target.value)}
          />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Слово (EN)</th>
            <th>Перевод (RU)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>
                <input
                  className="form-control"
                  value={entry.word}
                  onChange={(e) =>
                    handleEntryChange(index, "word", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  className="form-control"
                  value={entry.translation}
                  onChange={(e) =>
                    handleEntryChange(index, "translation", e.target.value)
                  }
                />
              </td>
              <td>
                {entries.length > 1 && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeRow(index)}
                  >
                    ❌
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-outline-secondary mb-3" onClick={addRow}>
        ➕ Добавить слово
      </button>

      <br />

      <button className="btn btn-success" onClick={handleSubmit}>
        📥 Импортировать
      </button>
    </div>
  );
};

export default VocabularyManualImport;
