// MatchExamplePairsGame.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import axios from "axios";

const subscriptionKey =
  "2sOjnCvNsCBpsib20ymPiEGySXXpwJCDOimvRFrFnzr94mSEQT4QJQQJ99BBAC5RqLJXJ3w3AAAbACOGL0Pl";
const region = "westeurope";

const MatchExamplePairsGame = ({ word, onComplete }) => {
  const [cards, setCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchExamplesAndTranslate = async () => {
      try {
        const res = await api.get(`/examples/${encodeURIComponent(word)}`);
        const examples = res.data.examples || [];

        const translations = await Promise.all(
          examples.map(async (text) => {
            const response = await axios.post(
              "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=ru",
              [{ Text: text }],
              {
                headers: {
                  "Ocp-Apim-Subscription-Key": subscriptionKey,
                  "Ocp-Apim-Subscription-Region": region,
                  "Content-Type": "application/json",
                },
              }
            );
            return response.data[0].translations[0].text;
          })
        );

        const paired = examples.map((e, i) => ({ en: e, ru: translations[i] }));

        const shuffled = shuffle(
          paired.flatMap((p) => [
            { type: "en", value: p.en, pair: p.ru },
            { type: "ru", value: p.ru, pair: p.en },
          ])
        );

        setCards(shuffled);
        setMatchedPairs([]);
        setSelectedCard(null);
      } catch (err) {
        console.error("Failed to load or translate examples:", err);
      }
    };

    fetchExamplesAndTranslate();
  }, [word]);

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const isMatched = (card) =>
    matchedPairs.some((pair) => pair.includes(card.value));

  const handleCardClick = (card) => {
    if (isMatched(card)) return;

    if (selectedCard && selectedCard.value === card.value) {
      setSelectedCard(null);
      return;
    }

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      const isCorrectPair =
        selectedCard.value === card.pair && selectedCard.pair === card.value;

      if (isCorrectPair) {
        setMatchedPairs((prev) => [...prev, [selectedCard.value, card.value]]);
        setSelectedCard(null);
      } else {
        setSelectedCard(null);
      }
    }
  };

  useEffect(() => {
    if (matchedPairs.length * 2 === cards.length && cards.length > 0) {
      onComplete?.();
    }
  }, [matchedPairs, cards.length, onComplete]);

  const getCardClass = (card) => {
    if (isMatched(card)) return "bg-success text-white";
    if (selectedCard?.value === card.value) return "bg-warning";
    return "bg-light text-dark";
  };

  return (
    <div className="match-game">
      <h5 className="mb-3">
        Match examples for: <strong>{word}</strong>
      </h5>

      <div className="d-flex flex-column gap-2">
        {cards.map((card, i) => (
          <button
            key={i}
            className={`btn w-100 text-start shadow-sm fw-normal rounded border ${getCardClass(
              card
            )}`}
            onClick={() => handleCardClick(card)}
          >
            {card.value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MatchExamplePairsGame;
