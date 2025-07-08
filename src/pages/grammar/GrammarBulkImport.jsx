import React, { useState, useContext } from "react";
import API from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

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
          status: "Skipped (missing course/lesson/sentence)",
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
      previewTable.push({ row, status: "Ready" });
    });

    setParsedObjects(objects);
    setPreview(previewTable);
  };

  const handleImport = async () => {
    if (parsedObjects.length === 0 && rawData.trim()) {
      alert("Please click 'Preview' first to prepare the data.");
      return;
    }

    if (parsedObjects.length === 0) {
      alert("No data to import.");
      return;
    }

    try {
      const res = await API.post("/grammar", parsedObjects);
      alert(`Successfully imported ${res.data.inserted.length} sentences.`);
      setRawData("");
      setParsedObjects([]);
      setPreview([]);
    } catch (err) {
      console.error("Import error:", err);
      alert("An error occurred during import.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Bulk Import from Table</h2>

      <p className="alert alert-light">
        <strong>Expected format:</strong>
        <br />
        <code>Course / Lesson / Sentence / Translation / Extra Words</code>
        <br />
        <em>Example:</em>
        <br />
        <code>
          A2 / Past Simple / I went to school / Я пошёл в школу / never quickly
          always
        </code>
      </p>

      <div className="row my-3">
        <div className="col-md-6">
          <label>Column delimiter:</label>
          <input
            className="form-control"
            placeholder="e.g. / or ,"
            value={colDelimiter}
            onChange={(e) => setColDelimiter(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label>Row delimiter:</label>
          <input
            className="form-control"
            placeholder="usually: \n or ;"
            value={rowDelimiter}
            onChange={(e) => setRowDelimiter(e.target.value)}
          />
        </div>
      </div>

      <label className="mt-3">Paste your data:</label>
      <textarea
        className="form-control"
        rows={10}
        placeholder="Paste rows from a spreadsheet in the format above"
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
          <h5>Parse result:</h5>
          <ul>
            {preview.map((item, i) => (
              <li key={i}>
                <code>{item.row}</code> —{" "}
                <strong
                  style={{
                    color: item.status.includes("Skipped")
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

export default GrammarBulkImport;
