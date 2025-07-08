import React, { useContext, useEffect, useState } from "react";
import API from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";
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
      console.error("Error loading courses:", err);
    }
  };

  const fetchLessons = async (courseName) => {
    try {
      const res = await API.get(
        `/lessons/${user.id}/${encodeURIComponent(courseName)}`
      );
      setLessons(res.data.lessons);
    } catch (err) {
      console.error("Error loading lessons:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchCourses();
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
      alert("Please specify a course and a lesson.");
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
      alert("No words to import.");
      return;
    }

    try {
      const res = await API.post("/words", prepared);
      alert(`Successfully imported ${res.data.inserted.length} words.`);
      setEntries([{ word: "", translation: "" }]);
    } catch (err) {
      console.error("Import error:", err);
      alert("Error during import.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manual Vocabulary Import</h2>

      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/import-vocabulary-extended")}
        >
          Open Extended Import
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <label>Select a course:</label>
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
            <option value="">— select a course —</option>
            {courses.map((course, i) => (
              <option key={i} value={course}>
                {course}
              </option>
            ))}
          </select>
          <input
            className="form-control mt-2"
            placeholder="or enter a new course"
            value={customCourse}
            onChange={(e) => setCustomCourse(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label>Select a lesson:</label>
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
            <option value="">— select a lesson —</option>
            {lessons.map((lesson, i) => (
              <option key={i} value={lesson}>
                {lesson}
              </option>
            ))}
          </select>
          <input
            className="form-control mt-2"
            placeholder="or enter a new lesson"
            value={customLesson}
            onChange={(e) => setCustomLesson(e.target.value)}
          />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Word (EN)</th>
            <th>Translation (RU)</th>
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
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-outline-secondary mb-3" onClick={addRow}>
        Add Word
      </button>

      <br />

      <button className="btn btn-success" onClick={handleSubmit}>
        Import Words
      </button>
    </div>
  );
};

export default VocabularyManualImport;
