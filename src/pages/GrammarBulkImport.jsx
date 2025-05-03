import React, { useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const GrammarBulkImport = () => {
  const { user } = useContext(AuthContext);
  const [rawData, setRawData] = useState("");
  const [colDelimiter, setColDelimiter] = useState("/");
  const [rowDelimiter, setRowDelimiter] = useState("\n");
  const [preview, setPreview] = useState([]);
  const [parsedObjects, setParsedObjects] = useState([]);

  const parseData = () => {
    const realRowDelimiter = rowDelimiter === "\\n" ? "\n" : rowDelimiter;
    const rows = rawData
      .split(realRowDelimiter)
      .map((row) => row.trim())
      .filter((r) => r.length > 0);

    const objects = [];
    const previewTable = [];

    rows.forEach((row) => {
      const cols = row.split(colDelimiter).map((c) => c.trim());

      const course = cols[0] || "";
      const lesson = cols[1] || "";
      const sentence = cols[2] || "";
      const translation = cols[3] || "";
      const extra = cols[4] || "";

      if (!course || !lesson || !sentence) {
        previewTable.push({
          row,
          status: "❌ пропущено (пустой курс/урок/предложение)",
        });
        return;
      }

      const obj = {
        userId: user.id,
        courseGrammarName: course,
        lessonGrammarName: lesson,
        sentenceGrammar: sentence,
        translation,
        extraWords: extra
          .split(/[,\s]+/)
          .filter(Boolean)
          .map((e) => e.trim()),
      };

      objects.push(obj);
      previewTable.push({ row, status: "✅ готово" });
    });

    setParsedObjects(objects);
    setPreview(previewTable);
  };

  const handleImport = async () => {
    if (parsedObjects.length === 0 && rawData.trim()) {
      alert("Сначала нажмите 'Предпросмотр', чтобы подготовить данные.");
      return;
    }

    if (parsedObjects.length === 0) {
      alert("Нет данных для импорта.");
      return;
    }

    try {
      const res = await API.post("/grammar", parsedObjects);
      alert(`✅ Импортировано ${res.data.inserted.length} предложений`);
      setRawData("");
      setParsedObjects([]);
      setPreview([]);
    } catch (err) {
      console.error("Ошибка импорта:", err);
      alert("Ошибка при импорте данных");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Импорт из таблицы (расширенный режим)</h2>

      <p className="alert alert-light">
        <strong>Ожидаемый формат:</strong>
        <br />
        <code>Курс / Урок / Предложение / Перевод / Лишние слова</code>
        <br />
        <em>Пример:</em>
        <br />
        <code>
          A2 / Past Simple / I went to school / Я пошёл в школу / never quickly
          always
        </code>
      </p>

      <div className="row my-3">
        <div className="col-md-6">
          <label>Разделитель колонок:</label>
          <input
            className="form-control"
            placeholder="например: / или ,"
            value={colDelimiter}
            onChange={(e) => setColDelimiter(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label>Разделитель строк:</label>
          <input
            className="form-control"
            placeholder="обычно: \n или ;"
            value={rowDelimiter}
            onChange={(e) => setRowDelimiter(e.target.value)}
          />
        </div>
      </div>

      <label className="mt-3">Вставьте данные:</label>
      <textarea
        className="form-control"
        rows={10}
        placeholder="Вставьте строки из таблицы по примеру"
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

export default GrammarBulkImport;
