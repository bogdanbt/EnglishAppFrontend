

import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";

// examplesPairs (optional): [{ en: string, ru: string }, ...]
// enrichment (optional): { translations: [...], usage_ru: "...", ... }
export default function MatchExamplePairsGame({
  word,
  onComplete,
  examplesPairs = null,
  enrichment = null,
}) {
  const [cards, setCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const completedRef = useRef(false);

  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);

  useEffect(() => {
    completedRef.current = false;
    setCards([]);
    setMatchedPairs([]);
    setSelectedCard(null);
    setLoading(true);

    (async () => {
      try {
        // ✅ Prefer AI pairs passed from parent
        const pairsFromProps = Array.isArray(examplesPairs) ? examplesPairs : null;

        if (pairsFromProps && pairsFromProps.length >= 3) {
          const pairs = pairsFromProps
            .filter((p) => p?.en && p?.ru)
            .slice(0, 4);

          const shuffled = shuffle(
            pairs.flatMap((p) => [
              { type: "en", value: p.en, pair: p.ru },
              { type: "ru", value: p.ru, pair: p.en },
            ])
          );

          setCards(shuffled);
          return;
        }

        // 🔁 Fallback: old behavior
        const res = await api.get(`/examples/${encodeURIComponent(word)}`);
        const examples = res.data?.examples || [];
        const tr = await api.post("/translate", { texts: examples });
        const translations = tr.data?.translations || [];

        const pairs = examples.map((e, i) => ({ en: e, ru: translations[i] }));
        const shuffled = shuffle(
          pairs.flatMap((p) => [
            { type: "en", value: p.en, pair: p.ru },
            { type: "ru", value: p.ru, pair: p.en },
          ])
        );

        setCards(shuffled);
      } catch (e) {
        console.error("load/translate failed:", e);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [word, onComplete, examplesPairs]);

  const isMatched = (card) => matchedPairs.some((pair) => pair.includes(card.value));

  const handleCardClick = (card) => {
    if (loading || completedRef.current) return;
    if (isMatched(card)) return;

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    if (selectedCard.value === card.value) {
      setSelectedCard(null);
      return;
    }

    const isCorrect =
      selectedCard.value === card.pair && selectedCard.pair === card.value;

    if (isCorrect) {
      setMatchedPairs((prev) => [...prev, [selectedCard.value, card.value]]);
    }
    setSelectedCard(null);
  };

  useEffect(() => {
    const allMatched = cards.length > 0 && matchedPairs.length * 2 === cards.length;
    if (allMatched && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [matchedPairs, cards.length, onComplete]);

  const getCardClass = (card) => {
    if (isMatched(card)) return "bg-success text-white";
    if (selectedCard?.value === card.value) return "bg-warning";
    return "bg-light text-dark";
  };

const translationsText =
  Array.isArray(enrichment?.translations) && enrichment.translations.length > 0
    ? enrichment.translations
        .map((t) => (typeof t === "string" ? t : t?.ru))
        .filter(Boolean)
        .join(", ")
    : null;


  return (
    <div className="match-game">
      <h5 className="mb-3">
        Match examples for: <strong>{word}</strong>
      </h5>

      {(translationsText || enrichment?.usage_ru) && (
        <div className="alert alert-light text-start">
          {translationsText && (
            <div>
              <strong>Переводы:</strong> {translationsText}
            </div>
          )}
          {enrichment?.usage_ru && (
            <div className="mt-1">
              <strong>Когда использовать:</strong> {enrichment.usage_ru}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {cards.map((card, i) => (
            <button
              key={`${card.type}-${i}-${card.value}`}
              className={`btn w-100 text-start shadow-sm fw-normal rounded border ${getCardClass(
                card
              )}`}
              onClick={() => handleCardClick(card)}
              disabled={loading || completedRef.current}
            >
              {card.value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
