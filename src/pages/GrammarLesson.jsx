import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";

const GrammarLesson = () => {
  const { user } = useContext(AuthContext);
  const { courseGrammarName, lessonGrammarName } = useParams();
  const decodedCourseName = decodeURIComponent(courseGrammarName);
  const decodedLessonName = decodeURIComponent(lessonGrammarName);
  const navigate = useNavigate();
  const [sentences, setSentences] = useState([]);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchSentences = async () => {
      try {
        const response = await API.get(
          `/grammar/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        setSentences(response.data);
      } catch (error) {
        console.error("Ошибка загрузки предложений:", error);
      }
    };

    fetchSentences();
  }, [user, decodedCourseName, decodedLessonName]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Урок: {decodedLessonName}</h2>

      {sentences.length === 0 ? (
        <p className="text-center mt-4">Пока нет предложений в этом уроке.</p>
      ) : (
        <>
          <div className="list-group mb-4">
            {sentences.map((item, index) => (
              <div
                key={index}
                className="list-group-item d-flex flex-column align-items-start"
              >
                <strong>RU:</strong> {item.translation}
                <span className="text-muted mt-1">
                  EN: {item.sentenceGrammar}
                </span>

                <div className="mt-2"> 
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      const newSentence = prompt(
                        "Новое английское предложение:",
                        item.sentenceGrammar
                      );
                      const newTranslation = prompt(
                        "Новый перевод:",
                        item.translation
                      );
                      if (newSentence && newTranslation) {
                        API.put(`/grammar/${item._id}`, {
                          sentenceGrammar: newSentence,
                          translation: newTranslation,
                        })
                          .then(() => window.location.reload())
                          .catch((err) =>
                            console.error("Ошибка редактирования:", err)
                          );
                      }
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                </div>
              
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to={`/grammar-course/${encodeURIComponent(
                courseGrammarName
              )}/lesson/${encodeURIComponent(lessonGrammarName)}/game`}
              className="btn btn-success"
            >
              🎮 Запустить игру
            </Link>
          </div>
          <button
            className="btn btn-outline-danger mt-3"
            onClick={async () => {
              try {
                await API.put("/grammar-progress", {
                  userId: user.id,
                  courseGrammarName: decodedCourseName,
                  lessonGrammarName: decodedLessonName,
                  repeats: 0,
                });
                alert("Прогресс сброшен!");
              } catch (err) {
                console.error("Ошибка сброса прогресса:", err);
              }
            }}
          >
            🔄 Обнулить прогресс
          </button>
          <div className="text-center mt-4"> 
            <button
              className="btn btn-danger"
              onClick={async () => {
                if (
                  window.confirm(
                    "Вы уверены, что хотите удалить весь урок?"
                  )
                ) {
                  try {
                    await API.delete(
                      `/grammar/${user.id}/${decodedCourseName}/${decodedLessonName}`
                    );
                    alert("Урок удалён.");
                    navigate(`/grammar-course/${courseGrammarName}`);
                  } catch (err) {
                    console.error("Ошибка удаления урока:", err);
                  }
                }
              }}
            >
              🗑️ Удалить весь урок
            </button>
          </div>

        </>
      )}
    </div>
  );
};

export default GrammarLesson;
