import React, { useEffect, useState } from "react";
import axios from "axios";

const SentenceTranslation = ({ sentence }) => {
  const [translation, setTranslation] = useState("");

  useEffect(() => {
    if (!sentence) return;
    const fetchSentence = async () => {
      try {
        const res = await axios.post(
          "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=ru",
          [{ text: sentence }],
          {
            headers: {
              "Ocp-Apim-Subscription-Key":
                "2sOjnCvNsCBpsib20ymPiEGySXXpwJCDOimvRFrFnzr94mSEQT4QJQQJ99BBAC5RqLJXJ3w3AAAbACOGL0Pl",
              "Ocp-Apim-Subscription-Region": "westeurope",
              "Content-Type": "application/json",
            },
          }
        );
        const result = res.data[0]?.translations?.[0]?.text;
        setTranslation(result);
      } catch (error) {
        console.error("Sentence translation error:", error);
      }
    };
    fetchSentence();
  }, [sentence]);

  return (
    <div className="text-muted small mt-1">
      <strong>Перевод:</strong> {translation}
    </div>
  );
};

export default SentenceTranslation;
