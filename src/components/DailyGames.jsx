

// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import MatchExamplePairsGame from "./MatchExamplePairsGame";
// import API from "../utils/api";

// const GAME_WORDS_KEY = "gameWordList";

// const DailyGames = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [wordList, setWordList] = useState([]);


//    // 🔒 защита от повторного входа в handleWordComplete
//   const progressingRef = useRef(false);


//   useEffect(() => {
//     const stored = localStorage.getItem(GAME_WORDS_KEY);
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         if (Array.isArray(parsed)) {
//           // очистим на всякий случай перед началом
//           localStorage.removeItem(GAME_WORDS_KEY);
//           localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(parsed));
//           setWordList(parsed);
//         }
//       } catch (err) {
//         console.error("Ошибка при чтении gameWordList:", err);
//       }
//     }
//   }, []);

//   const handleWordComplete = async () => {
//     const current = wordList[0];
//     const remaining = wordList.slice(1);

//     try {
//       await API.post("/append-history", {
//         userId: user.id,
//         word: current.word,
//         courseName: current.courseName,
//         date: new Date().toISOString(),
//         status: "intro",
//       });
//     } catch (error) {
//       console.error("Ошибка при отправке истории:", error);
//     }

//     if (remaining.length === 0) {
//       localStorage.removeItem(GAME_WORDS_KEY);
//       navigate("/courses");
//     } else {
//       localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(remaining));
//       setWordList(remaining);
//     }
//   };

//   return (
//     <div className="container mt-5 text-center">
//       {wordList.length > 0 ? (
//         <>
//           <p className="text-muted mb-3">
//             Осталось слов: {wordList.length}
//           </p>
//           <MatchExamplePairsGame
//             word={wordList[0].word}
//             onComplete={handleWordComplete}
//           />
//         </>
//       ) : (
//         <p>Загрузка слов...</p>
//       )}
//     </div>
//   );
// };

// export default DailyGames;
// DailyGames.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MatchExamplePairsGame from "./MatchExamplePairsGame";
import API from "../utils/api";

const GAME_WORDS_KEY = "gameWordList";

const DailyGames = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wordList, setWordList] = useState([]);

  // 🔒 защита от повторных завершений одного и того же слова
  const progressingRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(GAME_WORDS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // сохраняем сессию как есть
          setWordList(parsed);
        }
      } catch (err) {
        console.error("Ошибка при чтении gameWordList:", err);
      }
    }
  }, []);

  // Если очередь опустела и ключ отсутствует — уходим на курсы
  useEffect(() => {
    if (wordList.length === 0 && !localStorage.getItem(GAME_WORDS_KEY)) {
      navigate("/courses");
    }
  }, [wordList.length, navigate]);

  const handleWordComplete = async () => {
    if (progressingRef.current) return;
    progressingRef.current = true;

    let finishedWord = null;

    // ✅ режем очередь атомарно и синхронно обновляем localStorage
    setWordList((prev) => {
      const [current, ...rest] = prev;
      finishedWord = current || null;

      if (rest.length === 0) {
        localStorage.removeItem(GAME_WORDS_KEY);
      } else {
        localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(rest));
      }
      return rest;
    });

    try {
      if (finishedWord) {
        await API.post("/append-history", {
          userId: user.id,
          word: finishedWord.word,
          courseName: finishedWord.courseName,
          date: new Date().toISOString(),
          status: "intro", // оставляем как в текущей модели
        });
      }
    } catch (error) {
      console.error("Ошибка при отправке истории:", error);
    } finally {
      progressingRef.current = false;
    }
  };

  return (
    <div className="container mt-5 text-center">
      {wordList.length > 0 ? (
        <>
          <p className="text-muted mb-3">Осталось слов: {wordList.length}</p>
          <MatchExamplePairsGame
            word={wordList[0].word}
            onComplete={handleWordComplete}
          />
        </>
      ) : (
        <p>Загрузка слов...</p>
      )}
    </div>
  );
};

export default DailyGames;
