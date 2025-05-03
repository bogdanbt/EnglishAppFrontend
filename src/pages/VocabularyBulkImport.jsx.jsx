import React, { useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const VocabularyBulkImport = () => {
  const { user } = useContext(AuthContext);
  const [rawData, setRawData] = useState("");
  const [colDelimiter, setColDelimiter] = useState("/");
  const [rowDelimiter, setRowDelimiter] = useState("\n");
  const [preview, setPreview] = useState([]);
  const [parsedWords, setParsedWords] = useState([]);

  const parseData = () => {
    const actualRowDelimiter = rowDelimiter === "\\n" ? "\n" : rowDelimiter;
    const rows = rawData
      .split(actualRowDelimiter)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const objects = [];
    const previewTable = [];

    rows.forEach((row) => {
      const cols = row.split(colDelimiter).map((c) => c.trim());

      const course = cols[0] || "";
      const lesson = cols[1] || "";
      const word = cols[2] || "";
      const translation = cols[3] || "";

      if (!course || !lesson || !word || !translation) {
        previewTable.push({
          row,
          status: "❌ пропущено (недостаточно данных)",
        });
        return;
      }

      const obj = {
        userId: user.id,
        courseName: course,
        lessonName: lesson,
        word,
        translation,
        repeats: 0,
      };

      objects.push(obj);
      previewTable.push({ row, status: "✅ готово" });
    });

    setParsedWords(objects);
    setPreview(previewTable);
  };

  const handleImport = async () => {
    if (parsedWords.length === 0 && rawData.trim()) {
      alert("Сначала нажмите 'Предпросмотр', чтобы подготовить данные.");
      return;
    }

    if (parsedWords.length === 0) {
      alert("Нет данных для импорта.");
      return;
    }

    try {
      const res = await API.post("/words", parsedWords);
      alert(`✅ Импортировано ${res.data.inserted.length} слов`);
      setRawData("");
      setParsedWords([]);
      setPreview([]);
    } catch (err) {
      console.error("Ошибка при импорте слов:", err);
      alert("Ошибка при импорте");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Импорт слов (расширенный режим)</h2>

      <p className="alert alert-light">
        <strong>Ожидаемый формат:</strong>
        <br />
        <code>Курс / Урок / Слово / Перевод</code>
        <br />
        <em>Пример:</em>
        <br />
        <code>A2 / School / apple / яблоко</code>
      </p>

      <div className="row my-3">
        <div className="col-md-6">
          <label>Разделитель колонок:</label>
          <input
            className="form-control"
            value={colDelimiter}
            onChange={(e) => setColDelimiter(e.target.value)}
            placeholder="например: / или ,"
          />
        </div>
        <div className="col-md-6">
          <label>Разделитель строк:</label>
          <input
            className="form-control"
            value={rowDelimiter}
            onChange={(e) => setRowDelimiter(e.target.value)}
            placeholder="например: \n или ;"
          />
        </div>
      </div>

      <label>Вставьте данные:</label>
      <textarea
        className="form-control"
        rows={10}
        placeholder="Вставьте строки в формате: курс / урок / слово / перевод"
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
      />

      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={parseData}>
          🔍 Предпросмотр
        </button>
        <button className="btn btn-success" onClick={handleImport}>
          📥 Импортировать
        </button>
      </div>

      {preview.length > 0 && (
        <div className="mt-4">
          <h5>Результат разбора:</h5>
          <ul>
            {preview.map((item, i) => (
              <li key={i}>
                <code>{item.row}</code> —{" "}
                <strong
                  style={{
                    color: item.status.includes("❌") ? "crimson" : "green",
                  }}
                >
                  {item.status}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VocabularyBulkImport;
