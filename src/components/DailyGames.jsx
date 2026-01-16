import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MatchExamplePairsGame from "./MatchExamplePairsGame";
import API from "../utils/api";

const GAME_WORDS_KEY = "gameWordList";

export default function DailyGames() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [wordList, setWordList] = useState([]);
  const progressingRef = useRef(false);

  // ✅ AI enrichment for current word
  const [enrichment, setEnrichment] = useState(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState(null);

  // ✅ keep your offline/localStorage logic untouched
  useEffect(() => {
    const raw = localStorage.getItem(GAME_WORDS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setWordList(parsed);
    } catch (e) {
      console.error("bad gameWordList:", e);
    }
  }, []);

  // If nothing to play -> go back
  useEffect(() => {
    if (wordList.length === 0 && !localStorage.getItem(GAME_WORDS_KEY)) {
      navigate("/courses");
    }
  }, [wordList.length, navigate]);

  // ✅ enrich on game start (lazy, not on import)
  // ✅ enrich on game start (lazy, not on import)
useEffect(() => {
  const current = wordList?.[0];
  if (!user?.id || !current) return;

  const wordId = current._id || current.wordId;
  if (!wordId) {
    setEnrichment(null);
    setEnrichError("Current word has no _id/wordId in gameWordList.");
    return;
  }

  // ✅ single-flight: не запускай второй enrichment на тот же wordId
  // (если StrictMode/перерендеры — это спасает)
  const key = String(wordId);
  if (DailyGames.__inFlightKey === key) return;
  DailyGames.__inFlightKey = key;

  let cancelled = false;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    // setEnrichLoading(true);
    // setEnrichError(null);

    setEnrichLoading(true);
setEnrichError(null);
setEnrichment(null); // ✅ сброс старых данных при новом слове


    try {
      // 1) стартуем генерацию ровно 1 раз
      const start = await API.post("/ai/enrich-word", { wordId });

      // если сразу ready — отлично
      if (start.data?.status === "ready") {
        if (!cancelled) setEnrichment(start.data);
        return;
      }
      if (start.data?.status === "processing" || start.status === 202) {
        // ok, поллим дальше
      } else if (start.data?.status) {
        // иногда backend может вернуть док сразу
        if (!cancelled && start.data?.examples) setEnrichment(start.data);
        if (!cancelled) return;
      }

      // 2) polling только GET
      for (let i = 0; i < 12 && !cancelled; i++) {
        await sleep(700);
        const res = await API.get(`/ai/enrich-word/${encodeURIComponent(wordId)}`);
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
      const msg = e?.response?.data?.error || e?.message || "AI enrichment failed";
      if (!cancelled) setEnrichError(msg);
    } finally {
      if (!cancelled) setEnrichLoading(false);
      DailyGames.__inFlightKey = null;
    }
  };

  run();

  return () => {
    cancelled = true;
  };
}, [user?.id, wordList?.[0]?._id, wordList?.[0]?.wordId]);


  const handleWordComplete = async () => {
    if (progressingRef.current) return;
    progressingRef.current = true;

    let finished = null;
    setWordList((prev) => {
      const [curr, ...rest] = prev;
      finished = curr || null;

      // ✅ KEEP THIS — это твой offline/localStorage механизм
      if (rest.length === 0) localStorage.removeItem(GAME_WORDS_KEY);
      else localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(rest));

      return rest;
    });

    try {
      if (finished) {
        await API.post("/append-history", {
          userId: user.id,
          word: finished.word,
          courseName: finished.courseName,
          date: new Date().toISOString(),
          status: "intro",
        });
      }
    } catch (e) {
      console.error("append-history:", e);
    } finally {
      progressingRef.current = false;
    }
  };

  return (
    <div className="container mt-5 text-center">
      {wordList.length > 0 ? (
        <>
          <p className="text-muted mb-3">Осталось слов: {wordList.length}</p>

          {enrichLoading ? (
            <p>Готовлю примеры…</p>
          ) : enrichError ? (
            <div className="alert alert-danger">
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
            <MatchExamplePairsGame
              key={wordList[0].word}
              word={wordList[0].word}
              enrichment={enrichment} // ✅ вот это нужно для usage_ru + translations
              examplesPairs={enrichment?.examples || null} // ✅ вот это нужно чтобы НЕ дергать /examples
              onComplete={handleWordComplete}
            />
          )}
        </>
      ) : (
        <p>Загрузка слов...</p>
      )}
    </div>
  );
}
