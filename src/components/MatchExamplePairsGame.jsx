// // MatchExamplePairsGame.jsx
// import React, { useEffect, useState, useRef } from "react";
// import api from "../utils/api";
// // import axios from "axios";


// const MatchExamplePairsGame = ({ word, onComplete }) => {
//   const [cards, setCards] = useState([]);
//   const [matchedPairs, setMatchedPairs] = useState([]);
//   const [selectedCard, setSelectedCard] = useState(null);

// // 🔒 Защёлка от повторных onComplete (в т.ч. из-за StrictMode)
//   const didCompleteRef = useRef(false);

//   // Сброс защёлки при смене слова
//   useEffect(() => {
//     didCompleteRef.current = false;
//   }, [word]);



//   useEffect(() => {
//     const fetchExamplesAndTranslate = async () => {
//       try {
//         const res = await api.get(`/examples/${encodeURIComponent(word)}`);
//         const examples = res.data.examples || [];

// const response = await api.post("/translate", {
//   texts: examples,
// });
// const translations = response.data.translations || [];
     
// const paired = examples.map((e, i) => ({ en: e, ru: translations[i] }));

//         const shuffled = shuffle(
//           paired.flatMap((p) => [
//             { type: "en", value: p.en, pair: p.ru },
//             { type: "ru", value: p.ru, pair: p.en },
//           ])
//         );

//         setCards(shuffled);
//         setMatchedPairs([]);
//         setSelectedCard(null);
//       } catch (err) {
//         console.error("Failed to load or translate examples:", err);
//       }
//     };

//     fetchExamplesAndTranslate();
//   }, [word]);

//   const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

//   const isMatched = (card) =>
//     matchedPairs.some((pair) => pair.includes(card.value));

//   const handleCardClick = (card) => {
//     if (isMatched(card)) return;

//     if (selectedCard && selectedCard.value === card.value) {
//       setSelectedCard(null);
//       return;
//     }

//     if (!selectedCard) {
//       setSelectedCard(card);
//     } else {
//       const isCorrectPair =
//         selectedCard.value === card.pair && selectedCard.pair === card.value;

//       if (isCorrectPair) {
//         setMatchedPairs((prev) => [...prev, [selectedCard.value, card.value]]);
//         setSelectedCard(null);
//       } else {
//         setSelectedCard(null);
//       }
//     }
//   };

//   // useEffect(() => {
//   //   if (matchedPairs.length * 2 === cards.length && cards.length > 0) {
//   //     onComplete?.();
//   //   }
//   // }, [matchedPairs, cards.length, onComplete]);

//   // const getCardClass = (card) => {
//   //   if (isMatched(card)) return "bg-success text-white";
//   //   if (selectedCard?.value === card.value) return "bg-warning";
//   //   return "bg-light text-dark";
//   // };
// // ✅ Одноразовый вызов onComplete
//   useEffect(() => {
//     const allMatched = cards.length > 0 && matchedPairs.length * 2 === cards.length;
//     if (allMatched && !didCompleteRef.current) {
//       didCompleteRef.current = true;
//       onComplete?.();
//     }
//   }, [matchedPairs, cards.length, onComplete]);

//   const getCardClass = (card) => {
//     if (isMatched(card)) return "bg-success text-white";
//     if (selectedCard?.value === card.value) return "bg-warning";
//     return "bg-light text-dark";
//   };

//   return (
//     <div className="match-game">
//       <h5 className="mb-3">
//         Match examples for: <strong>{word}</strong>
//       </h5>

//       <div className="d-flex flex-column gap-2">
//         {cards.map((card, i) => (
//           <button
//             key={i}
//             className={`btn w-100 text-start shadow-sm fw-normal rounded border ${getCardClass(
//               card
//             )}`}
//             onClick={() => handleCardClick(card)}
//           >
//             {card.value}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MatchExamplePairsGame;
// MatchExamplePairsGame.jsx

import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";

export default function MatchExamplePairsGame({ word, onComplete }) {
  const [cards, setCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const completedRef = useRef(false);

  // Новый раунд: полный сброс
  useEffect(() => {
    completedRef.current = false;
    setCards([]);
    setMatchedPairs([]);
    setSelectedCard(null);
    setLoading(true);

    // (async () => {
    //   try {
    //     const res = await api.get(`/examples/${encodeURIComponent(word)}`);
    //     const examples = res.data?.examples || [];
    //     const tr = await api.post("/translate", { texts: examples });
    //     const translations = tr.data?.translations || [];

    //     const pairs = examples.map((e, i) => ({ en: e, ru: translations[i] }));
    //     const shuffled = shuffle(
    //       pairs.flatMap(p => [
    //         { type: "en", value: p.en, pair: p.ru },
    //         { type: "ru", value: p.ru, pair: p.en },
    //       ])
    //     );
    //     setCards(shuffled);
    //   } catch (e) {
    //     console.error("load/translate failed:", e);
    //     // если слово пустое/ошибка — не блокируемся
    //     if (!completedRef.current) {
    //       completedRef.current = true;
    //       onComplete?.();
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // })();
        (async () => {
      try {
        const r = await api.post("/word-card/resolve", {
          word,
          targetLang: "ru",
          levelHint: "B1",
        });

        const examples = r.data?.examples || [];
        const pairs = examples
          .filter((e) => e?.en && e?.translations?.ru)
          .map((e) => ({ en: e.en, ru: e.translations.ru }));

        const shuffled = shuffle(
          pairs.flatMap((p) => [
            { type: "en", value: p.en, pair: p.ru },
            { type: "ru", value: p.ru, pair: p.en },
          ])
        );

        setCards(shuffled);
      } catch (e) {
        console.error("resolve failed:", e);
        // НЕ пропускаем слово молча — просто покажем пусто и дадим перезагрузить
        setCards([]);
      } finally {
        setLoading(false);
      }
    })();

  }, [word, onComplete]);

  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);

  const isMatched = (card) =>
    matchedPairs.some(pair => pair.includes(card.value));

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
      setMatchedPairs(prev => [...prev, [selectedCard.value, card.value]]);
    }
    setSelectedCard(null);
  };

  // Единственное место, где завершаем слово
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

  return (
    <div className="match-game">
      <h5 className="mb-3">Match examples for: <strong>{word}</strong></h5>
      <div className="d-flex flex-column gap-2">
        {cards.map((card, i) => (
          <button
            key={i}
            className={`btn w-100 text-start shadow-sm fw-normal rounded border ${getCardClass(card)}`}
            onClick={() => handleCardClick(card)}
            disabled={loading || completedRef.current}
          >
            {card.value}
          </button>
        ))}
      </div>
    </div>
  );
}
