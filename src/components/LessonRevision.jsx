

// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import KnowledgeTypingGame from "./KnowledgeTypingGame";

// const GAME_WORDS_KEY = "gameWordList";

// const LessonRevision = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [wordList, setWordList] = useState([]);

//   useEffect(() => {
//     const stored = localStorage.getItem(GAME_WORDS_KEY);
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         if (Array.isArray(parsed)) {
//           setWordList(parsed);
//         } else {
//           navigate("/courses");
//         }
//       } catch {
//         navigate("/courses");
//       }
//     } else {
//       navigate("/courses");
//     }
//   }, [navigate]);

//   const handleComplete = (updatedList) => {
//     if (updatedList.length === 0) {
//       localStorage.removeItem(GAME_WORDS_KEY);
//       navigate("/courses");
//     } else {
//       localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(updatedList));
//       setWordList(updatedList);
//     }
//   };

//   const current = wordList[0];

//   return (
//     <div className="container mt-5">
//       {current ? (
//         <KnowledgeTypingGame
//           word={current.word}
//           translation={current.translation}
//           example={current.example}
//           userId={user.id}
//           courseName={current.courseName}
//           onComplete={() => handleComplete(wordList.slice(1))}
//         />
//       ) : (
//         <p className="text-center">Загрузка...</p>
//       )}
//     </div>
//   );
// };

// export default LessonRevision;

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import KnowledgeTypingGame from "./KnowledgeTypingGame";
import API from "../utils/api";

const GAME_WORDS_KEY = "gameWordList";

const LessonRevision = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wordList, setWordList] = useState([]);

  const [enrichment, setEnrichment] = useState(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(GAME_WORDS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWordList(parsed);
        } else {
          navigate("/courses");
        }
      } catch {
        navigate("/courses");
      }
    } else {
      navigate("/courses");
    }
  }, [navigate]);

  const handleComplete = (updatedList) => {
    // localStorage поведение оставляем как было
    if (updatedList.length === 0) {
      localStorage.removeItem(GAME_WORDS_KEY);
      navigate("/courses");
    } else {
      localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(updatedList));
      setWordList(updatedList);
    }
  };

  const current = wordList[0];

  // AI enrichment для текущего слова перед запуском раунда
useEffect(() => {
  if (!user?.id || !current) return;

  const word = current.word?.trim().toLowerCase();
  if (!word) {
    setEnrichment(null);
    setEnrichError("No word found in gameWordList.");
    return;
  }

  // single-flight
  if (LessonRevision.__inFlightKey === word) return;
  LessonRevision.__inFlightKey = word;

  let cancelled = false;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    setEnrichLoading(true);
    setEnrichError(null);
    setEnrichment(null);

    try {
      // 1) стартуем генерацию
      const start = await API.post("/ai/enrich-word", { word });

      if (start.data?.status === "ready") {
        if (!cancelled) setEnrichment(start.data);
        return;
      }

      // 2) polling GET
      for (let i = 0; i < 12 && !cancelled; i++) {
        await sleep(700);

        const res = await API.get(
          `/ai/enrich-word?word=${encodeURIComponent(word)}`
        );

        if (res.data?.status === "ready") {
          if (!cancelled) setEnrichment(res.data);
          return;
        }

        if (res.data?.status === "failed") {
          throw new Error(res.data?.error || "AI enrichment failed");
        }
      }

      throw new Error("AI enrichment timeout. Try again.");
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "AI enrichment failed";
      if (!cancelled) setEnrichError(msg);
    } finally {
      if (!cancelled) setEnrichLoading(false);
      LessonRevision.__inFlightKey = null;
    }
  };

  run();

  return () => {
    cancelled = true;
    LessonRevision.__inFlightKey = null;
  };
}, [user?.id, current?.word]);

  return (
    <div className="container mt-5">
      {current ? (
        enrichLoading ? (
          <p className="text-center">Готовлю примеры…</p>
        ) : enrichError ? (
          <div className="alert alert-danger text-center">
            {enrichError}
            <div className="mt-2">
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <KnowledgeTypingGame
            word={current.word}
            userId={user.id}
            courseName={current.courseName}
            // берём первый AI-пример (в формате {en, ru})
            examplePair={
              Array.isArray(enrichment?.examples) ? enrichment.examples[0] : null
            }
            onComplete={() => handleComplete(wordList.slice(1))}
          />
        )
      ) : (
        <p className="text-center">Загрузка...</p>
      )}
    </div>
  );
};

export default LessonRevision;
