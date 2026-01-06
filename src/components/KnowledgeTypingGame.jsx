import React, { useEffect, useState } from "react";
import API from "../utils/api";

const KnowledgeTypingGame = ({ word, userId, courseName, onComplete }) => {
  const [sentence, setSentence] = useState("");
  const [translation, setTranslation] = useState("");
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(1);
  const [usedHint, setUsedHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setInput("");
      setRevealed(1);
      setUsedHint(false);
      setCompleted(false);
      setSentence("");
      setTranslation("");
      setLoading(true);

      let example = "";
      try {
        const res = await API.get(`/examples/${encodeURIComponent(word)}`);
        example = res?.data?.examples?.[0] || "";
      } catch {
        // fallback
      }

      if (!example) {
        example = `This is a sample sentence with the word ${word}.`;
      }

      setSentence(example);

      try {
        const res = await API.post("/translate", { texts: [example] });
        const translated = res?.data?.translations?.[0] || "(перевод недоступен)";
        setTranslation(translated);
      } catch {
        setTranslation("(перевод недоступен)");
      }

      setLoading(false);
    };

    load();
  }, [word]);

  const getMaskedWord = () =>
    word
      .split("")
      .map((ch, i) => (i < revealed ? ch : "_"))
      .join("");

  const getMaskedSentence = () => {
    const index = sentence.toLowerCase().indexOf(word.toLowerCase());
    if (index === -1) return sentence;

    const before = sentence.slice(0, index);
    const after = sentence.slice(index + word.length);
    return `${before}${getMaskedWord()}${after}`;
  };

  const handleInput = async (e) => {
    const val = e.target.value;
    setInput(val);

    if (val.toLowerCase() === word.toLowerCase() && !completed) {
      setCompleted(true);
      try {
        await API.post("/append-history", {
          userId,
          word,
          courseName,
          date: new Date().toISOString(),
          status: usedHint ? "fail" : "success",
        });
      } catch (err) {
        console.error("Ошибка сохранения истории:", err);
      }

      onComplete();
    }
  };

  const handleReveal = () => {
    if (revealed < word.length) {
      setRevealed(revealed + 1);
      setUsedHint(true);
    }
  };

  if (loading) return <div className="text-center mt-4">Загрузка...</div>;

  return (
    <div className="container mt-4 text-center">
      <h5 className="mb-2">Перевод:</h5>
      <p className="alert alert-info">{translation}</p>

      <h5 className="mb-2">Предложение:</h5>
      <p className="alert alert-secondary">{getMaskedSentence()}</p>

      <h5 className="mb-2">Введите слово:</h5>
      <div className="display-6 mb-3">{getMaskedWord()}</div>

      <input
        type="text"
        value={input}
        onChange={handleInput}
        disabled={completed}
        className="form-control text-center mb-3"
      />

      <button
        className="btn btn-outline-secondary"
        onClick={handleReveal}
        disabled={completed || revealed >= word.length}
      >
        Показать букву
      </button>
    </div>
  );
};

export default KnowledgeTypingGame;
