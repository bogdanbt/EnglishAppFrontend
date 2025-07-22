// ✅ Обновлённый CoursePage с фильтрацией слов по дате последнего повторения

import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../utils/api";

const GAME_WORDS_KEY = "gameWordList";

const CoursePage = () => {
  const { user } = useContext(AuthContext);
  const { courseName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);

  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const wordsPerSession = 10;
  const targetSuccessCount = 2;

  useEffect(() => {
    if (!user || !user.id) return;

    const loadCourseProgress = async () => {
      try {
        const wordRes = await API.get(`/words/${user.id}/${decodedCourseName}`);
        const allWords = wordRes.data?.data || [];
        setWords(allWords);

        const progRes = await API.get(`/repetition/${user.id}/${decodedCourseName}`);
        const repetition = progRes.data?.data || [];
        setProgress(repetition);
      } catch (err) {
        console.error("Failed to load course progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseProgress();
  }, [user, decodedCourseName]);

  const isNotToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.getFullYear() !== today.getFullYear() ||
           date.getMonth() !== today.getMonth() ||
           date.getDate() !== today.getDate();
  };

  const groupByStatus = (targetSuccessCount = 2) => {
    const groups = {
      new: [],
      intro: [],
      forgotten: [],
      done: [],
    };

    for (let i = 1; i < targetSuccessCount; i++) {
      groups[`success${i}`] = [];
    }

    const knownWords = new Set(progress.map((p) => p.word));

    const countRecentConsecutiveSuccesses = (history) => {
      const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      let count = 0;

      for (let i = sorted.length - 1; i >= 0; i--) {
        const status = sorted[i].status;
        if (status === "success") {
          count++;
        } else if (status === "fail") {
          count = 0;
          break;
        } else {
          break;
        }
      }

      return count;
    };
//////
for (const entry of progress) {
  const word = entry.word;
  const history = entry.history || [];
  const lastStatus = history.at(-1)?.status || null;
  const lastDate = history.at(-1)?.date || null;

  const isAvailable = lastDate ? isNotToday(lastDate) : false;

  const fullWord = words.find((w) => w.word === word);
  if (!fullWord) continue;

  // const wordObj = { ...fullWord, courseName: decodedCourseName, available: isAvailable };
const wordObj = {
  ...fullWord,
  courseName: decodedCourseName,
  userId: user.id,
  available: isAvailable,
};

  if (lastStatus === "intro") {
    groups.intro.push(wordObj);
    continue;
  }

  if (lastStatus === "fail") {
    groups.forgotten.push(wordObj);
    continue;
  }

  const count = countRecentConsecutiveSuccesses(history);

  if (count >= targetSuccessCount) {
    groups.done.push(wordObj);
  } else if (count > 0) {
    groups[`success${count}`]?.push(wordObj);
  }
}

// 
    // for (const entry of progress) {
    //   const word = entry.word;
    //   const history = entry.history || [];
    //   const lastStatus = history.at(-1)?.status || null;
    //   const lastDate = history.at(-1)?.date || null;

    //   const isAvailable = lastDate ? isNotToday(lastDate) : true;

    //   const wordObj = { word, courseName: decodedCourseName, available: isAvailable };

    //   if (lastStatus === "intro") {
    //     groups.intro.push(wordObj);
    //     continue;
    //   }

    //   if (lastStatus === "fail") {
    //     groups.forgotten.push(wordObj);
    //     continue;
    //   }

    //   const count = countRecentConsecutiveSuccesses(history);

    //   if (count >= targetSuccessCount) {
    //     groups.done.push(wordObj);
    //   } else if (count > 0) {
    //     groups[`success${count}`]?.push(wordObj);
    //   }
    // }
////////
    // for (const wordObj of words) {
    //   if (!knownWords.has(wordObj.word)) {
    //     groups.new.push({ ...wordObj, courseName: decodedCourseName, available: true });
    //   }
    // }
for (const wordObj of words) {
  if (!knownWords.has(wordObj.word)) {
    groups.new.push({
      ...wordObj,
      courseName: decodedCourseName,
      userId: user.id,
      available: true,
    });
  }
}

    return groups;
  };

  const groups = groupByStatus(targetSuccessCount);

  const startGameWithWords = (wordList, type = "daily") => {
    localStorage.removeItem(GAME_WORDS_KEY);
    localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(wordList));

    if (type === "daily") {
      navigate("/daily-games");
    } else if (type === "exam") {
      navigate("/revision");
    }
  };

  const renderGroup = (title, wordObjs, color, groupKey) => {
    const availableWords = wordObjs.filter((w) => w.available);

    return (
      <div className="mb-4">
        <h4 style={{ color }}>
          {title} ({wordObjs.length} / {availableWords.length})
        </h4>

        {groupKey === "new" && availableWords.length > 0 && (
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => startGameWithWords(availableWords.slice(0, wordsPerSession), "daily")}
          >
            Первая игра
          </button>
        )}

        {groupKey !== "new" && availableWords.length > 0 && (
          <button
            className="btn btn-outline-dark btn-sm mb-2"
            onClick={() => startGameWithWords(availableWords.slice(0, wordsPerSession), "exam")}
          >
            Exam
          </button>
        )}

        {/* <div className="d-flex flex-wrap gap-2">
          {wordObjs.map((w, i) => (
            <span
              key={i}
              className={`badge border ${w.available ? "bg-light text-dark" : "bg-secondary text-light"}`}
            >
              {w.word}
            </span>
          ))}
        </div> */}
      </div>
    );
  };

  const renderAllGroups = (groups, targetSuccessCount) => (
    <>
      {renderGroup("🆕 New Words", groups.new, "#6c757d", "new")}
      {renderGroup("👁 Introduced", groups.intro, "#0d6efd", "intro")}
      {renderGroup("❌ Forgotten", groups.forgotten, "#dc3545", "forgotten")}

      {Array.from({ length: targetSuccessCount - 1 }, (_, i) => {
        const count = i + 1;
        const suffix = count === 1 ? "st" : count === 2 ? "nd" : count === 3 ? "rd" : "th";
        const title = `✅ ${count}${suffix} Repeat`;
        return renderGroup(title, groups[`success${count}`], "#198754", `success${count}`);
      })}

      {renderGroup("🏁 Completed", groups.done, "#0dcaf0", "done")}
    </>
  );

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Course: {decodedCourseName}</h2>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          {renderAllGroups(groups, targetSuccessCount)}

          <div className="mt-4">
            <h4 className="text-muted">📋 All Words ({words.length})</h4>
            <div className="d-flex flex-wrap gap-2">
              {words.map((w, i) => (
                <span key={i} className="badge bg-secondary">{w.word}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CoursePage;
