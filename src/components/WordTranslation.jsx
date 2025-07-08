import React, { useEffect, useState } from "react";
import axios from "axios";

const WordTranslation = ({ word }) => {
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    if (!word) return;
    const fetchTranslation = async () => {
      try {
        const res = await axios.post(
          "https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0&from=en&to=ru",
          [{ text: word }],
          {
            headers: {
              "Ocp-Apim-Subscription-Key":
                "2sOjnCvNsCBpsib20ymPiEGySXXpwJCDOimvRFrFnzr94mSEQT4QJQQJ99BBAC5RqLJXJ3w3AAAbACOGL0Pl",
              "Ocp-Apim-Subscription-Region": "westeurope",
              "Content-Type": "application/json",
            },
          }
        );
        const variants =
          res.data[0]?.translations?.map((t) => t.normalizedTarget) || [];
        setTranslations(variants.slice(0, 5)); // максимум 5 вариантов
      } catch (error) {
        console.error("Word translation error:", error);
      }
    };
    fetchTranslation();
  }, [word]);

  return (
    <div className="mb-2">
      <strong>Переводы:</strong>{" "}
      {translations.map((t, i) => (
        <span key={i} className="badge bg-light text-dark me-1">
          {t}
        </span>
      ))}
    </div>
  );
};

export default WordTranslation;
