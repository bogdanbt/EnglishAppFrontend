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
          status: "Skipped (missing fields)",
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
      previewTable.push({ row, status: "Ready" });
    });

    setParsedWords(objects);
    setPreview(previewTable);
  };

  const handleImport = async () => {
    if (parsedWords.length === 0 && rawData.trim()) {
      alert("Click 'Preview' first to prepare the data.");
      return;
    }

    if (parsedWords.length === 0) {
      alert("No data to import.");
      return;
    }

    try {
      const res = await API.post("/words", parsedWords);
      alert(`Imported ${res.data.inserted.length} words successfully.`);
      setRawData("");
      setParsedWords([]);
      setPreview([]);
    } catch (err) {
      console.error("Import error:", err);
      alert("Error during import.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Vocabulary Import (Advanced Mode)</h2>

      <p className="alert alert-light">
        <strong>Expected format:</strong>
        <br />
        <code>Course / Lesson / Word / Translation</code>
        <br />
        <em>Example:</em>
        <br />
        <code>A2 / School / apple / яблоко</code>
      </p>

      <div className="row my-3">
        <div className="col-md-6">
          <label>Column delimiter:</label>
          <input
            className="form-control"
            value={colDelimiter}
            onChange={(e) => setColDelimiter(e.target.value)}
            placeholder="e.g., / or ,"
          />
        </div>
        <div className="col-md-6">
          <label>Row delimiter:</label>
          <input
            className="form-control"
            value={rowDelimiter}
            onChange={(e) => setRowDelimiter(e.target.value)}
            placeholder="e.g., \\n or ;"
          />
        </div>
      </div>

      <label>Paste your data:</label>
      <textarea
        className="form-control"
        rows={10}
        placeholder="Paste lines in format: course / lesson / word / translation"
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
      />

      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={parseData}>
          Preview
        </button>
        <button className="btn btn-success" onClick={handleImport}>
          Import
        </button>
      </div>

      {preview.length > 0 && (
        <div className="mt-4">
          <h5>Parsing Result:</h5>
          <ul>
            {preview.map((item, i) => (
              <li key={i}>
                <code>{item.row}</code> —{" "}
                <strong
                  style={{
                    color: item.status.toLowerCase().includes("skipped")
                      ? "crimson"
                      : "green",
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
