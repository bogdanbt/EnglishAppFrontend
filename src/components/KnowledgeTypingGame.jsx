import React, { useEffect, useState } from "react";
import API from "../utils/api";
import axios from "axios";

const MICROSOFT_TRANSLATE_ENDPOINT =
  "https://api.cognitive.microsofttranslator.com/translate";
const MICROSOFT_API_KEY =
  "2sOjnCvNsCBpsib20ymPiEGySXXpwJCDOimvRFrFnzr94mSEQT4QJQQJ99BBAC5RqLJXJ3w3AAAbACOGL0Pl";
const MICROSOFT_REGION = "westeurope";

const KnowledgeTypingGame = ({ word, onComplete, courseName, userId }) => {
  const [sentence, setSentence] = useState("");
  const [translation, setTranslation] = useState("");
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(1);
  const [usedHint, setUsedHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // сброс при новом слове
  useEffect(() => {
    setInput("");
    setRevealed(1);
    setUsedHint(false);
    setCompleted(false);
    setTranslation("");
    setSentence("");
    setLoading(true);

    const load = async () => {
      let original = "";

      try {
        const res = await API.get(`/examples/${encodeURIComponent(word)}`);
        const example = res?.data?.examples?.[0];
        original = example || "";
      } catch {
        // fallback если ошибка при загрузке
      }

      // fallback предложение, если нет примера
      if (!original) {
        original = `Hello, this is your word: ${word}.`;
      }

      setSentence(original);

      try {
        const res = await axios.post(
          `${MICROSOFT_TRANSLATE_ENDPOINT}?api-version=3.0&to=ru`,
          [{ Text: original }],
          {
            headers: {
              "Ocp-Apim-Subscription-Key": MICROSOFT_API_KEY,
              "Ocp-Apim-Subscription-Region": MICROSOFT_REGION,
              "Content-Type": "application/json",
            },
          }
        );
        const translated = res?.data?.[0]?.translations?.[0]?.text || "";
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
    const lowerSentence = sentence.toLowerCase();
    const lowerWord = word.toLowerCase();
    const index = lowerSentence.indexOf(lowerWord);

    if (index === -1) return sentence;

    const before = sentence.slice(0, index);
    const after = sentence.slice(index + word.length);
    return `${before}${getMaskedWord()}${after}`;
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val.toLowerCase() === word.toLowerCase() && !completed) {
      setCompleted(true);
      const endpoint = usedHint ? "reset" : "increase";
      API.post(`/knowledge/${endpoint}`, {
        userId,
        word,
        courseName,
      }).catch(() => {});

      onComplete();
    }
  };

  const handleReveal = () => {
    if (revealed < word.length) {
      setRevealed(revealed + 1);
      setUsedHint(true);
    }
  };

  if (loading) return <div className="text-center mt-3">Loading...</div>;

  return (
    <div className="container mt-4">
      <h5 className="mb-2">Translate:</h5>
      <p className="alert alert-info">{translation}</p>

      <h5 className="mb-2">Sentence:</h5>
      <p className="alert alert-secondary">{getMaskedSentence()}</p>

      <h5 className="mb-2">Type the missing word:</h5>
      <div className="display-6 text-center mb-3">{getMaskedWord()}</div>

      <input
        type="text"
        value={input}
        onChange={handleInput}
        disabled={completed}
        className="form-control mb-3 text-center"
      />

      <div className="text-center">
        <button
          onClick={handleReveal}
          className="btn btn-outline-secondary"
          disabled={completed || revealed >= word.length}
        >
          Reveal letter
        </button>
      </div>
    </div>
  );
};

export default KnowledgeTypingGame;
