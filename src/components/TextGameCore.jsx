import React, { useEffect, useState } from "react";
import "./UsageExamples.css";

const TextGameCore = ({ word, onNext }) => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [userInput2, setUserInput2] = useState("");
  const [isCorrect2, setIsCorrect2] = useState(false);
  const [userInput3, setUserInput3] = useState("");
  const [isCorrect3, setIsCorrect3] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [renderNumber, setRenderNumber] = useState(1);


  useEffect(() => {
    if (isCorrect && isCorrect2 && isCorrect3 && renderNumber >= 13) {
      const timer = setTimeout(() => {
        setCompleted(true);
        if (onNext) {
          onNext(); 
        }
      }, 1500); 

      return () => clearTimeout(timer); 
    }
  }, [isCorrect, isCorrect2, isCorrect3, renderNumber, onNext]);

  useEffect(() => {
    if (!word) return;

    const fetchUsageExamples = async () => {
      setLoading(true);
      setError(null);
      try {
        const translationResponse = await fetch(
          "https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0&from=en&to=ru",
          {
            method: "POST",
            headers: {
              "Ocp-Apim-Subscription-Key":
                "2sOjnCvNsCBpsib20ymPiEGySXXpwJCDOimvRFrFnzr94mSEQT4QJQQJ99BBAC5RqLJXJ3w3AAAbACOGL0Pl",
              "Ocp-Apim-Subscription-Region": "westeurope",
              "Content-Type": "application/json",
            },
            body: JSON.stringify([{ Text: word }]),
          }
        );

        if (!translationResponse.ok)
          throw new Error(`Error translate: ${translationResponse.status}`);

        const translationData = await translationResponse.json();
        const topTranslations = (translationData[0]?.translations || [])
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 4)
          .map((t) => t.normalizedTarget);

        if (topTranslations.length === 0) {
          setError("Translates not found.");
          setLoading(false);
          return;
        }

        const examplesResponse = await fetch(
          "https://api.cognitive.microsofttranslator.com/dictionary/examples?api-version=3.0&from=en&to=ru",
          {
            method: "POST",
            headers: {
              "Ocp-Apim-Subscription-Key":
                "2sOjnCvNsCBpsib20ymPiEGySXXpwJCDOimvRFrFnzr94mSEQT4QJQQJ99BBAC5RqLJXJ3w3AAAbACOGL0Pl",
              "Ocp-Apim-Subscription-Region": "westeurope",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              topTranslations.map((translation) => ({
                Text: word,
                Translation: translation,
              }))
            ),
          }
        );

        if (!examplesResponse.ok)
          throw new Error(`Ошибка примеров: ${examplesResponse.status}`);

        const examplesData = await examplesResponse.json();
        const allExamples = examplesData
          .flatMap((item) => item.examples || [])
          .slice(0, 3);

        if (allExamples.length === 0) {
          setError("sentence  not found");
        } else {
          setExamples(allExamples);
        }
      } catch (err) {
        console.error("sentence not loading", err);
        setError("sentence not loading.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageExamples();
  }, [word]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (completed) return <div>🎉 Congratulations.</div>;


  const debugMode = false; 


  return (
    <>
      <h2>{word}</h2>

      {debugMode && (
        <button onClick={onNext} className="btn btn-sm btn-secondary mb-3">
          Debug: Next Word
        </button>
      )}

      <div>
        {renderNumber >= 1 && (
          <div onAnimationEnd={() => setRenderNumber(2)}>
            <h5 className="typing-text">
              {examples[0]?.targetPrefix} <b>{examples[0]?.targetTerm}</b>{" "}
              {examples[0]?.targetSuffix}
            </h5>
          </div>
        )}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {renderNumber >= 2 && (
            <div onAnimationEnd={() => setRenderNumber(3)}>
              <h5 className="typing-text">{examples[0]?.sourcePrefix}</h5>
            </div>
          )}
          {renderNumber >= 3 && (
            <div>
              <form
                className="d-flex align-items-center gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                {currentExampleIndex === 0 && !isCorrect ? (
                  <input
                    type="text"
                    className="form-control d-inline w-auto"
                    placeholder="..."
                    value={userInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserInput(value);
                      if (
                        value.trim().toLowerCase() ===
                        examples[0]?.sourceTerm.toLowerCase()
                      ) {
                        setIsCorrect(true); 
                        setRenderNumber(4);
                      } else {
                        setIsCorrect(false); 
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <b className="text-success">{examples[0]?.sourceTerm}</b>
                )}
              </form>
              {currentExampleIndex === 0 && !isCorrect && userInput && (
                <small className="text-danger">
                  Try again
                </small>
              )}
              {isCorrect && <small className="text-success">✅ Correct!</small>}
            </div>
          )}

          {renderNumber >= 4 && (
            <div onAnimationEnd={() => setRenderNumber(5)}>
              <h5 className="typing-text">{examples[0]?.sourceSuffix}</h5>
            </div>
          )}
        </div>
      </div>

      <div>
        {renderNumber >= 5 && (
          <div onAnimationEnd={() => setRenderNumber(6)}>
            <h5 className="typing-text">
              {examples[1]?.targetPrefix} <b>{examples[1]?.targetTerm}</b>{" "}
              {examples[1]?.targetSuffix}
            </h5>
          </div>
        )}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {renderNumber >= 6 && (
            <div onAnimationEnd={() => setRenderNumber(7)}>
              <h5 className="typing-text">{examples[1]?.sourcePrefix}</h5>
            </div>
          )}
          {renderNumber >= 7 && (
            <div>
              <form
                className="d-flex align-items-center gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                {currentExampleIndex === 0 && !isCorrect2 ? (
                  <input
                    type="text"
                    className="form-control d-inline w-auto"
                    placeholder="..."
                    value={userInput2}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserInput2(value);
                      if (
                        value.trim().toLowerCase() ===
                        examples[1]?.sourceTerm.toLowerCase()
                      ) {
                        setIsCorrect2(true); 
                        setRenderNumber(8);
                      } else {
                        setIsCorrect2(false); 
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <b className="text-success">{examples[1]?.sourceTerm}</b>
                )}
              </form>
              {currentExampleIndex === 0 && !isCorrect2 && userInput2 && (
                <small className="text-danger">
                  Try again
                </small>
              )}
              {isCorrect2 && <small className="text-success">✅ Correct!</small>}
            </div>
          )}

          {renderNumber >= 8 && (
            <div onAnimationEnd={() => setRenderNumber(9)}>
              <h5 className="typing-text">{examples[1]?.sourceSuffix}</h5>
            </div>
          )}
        </div>
      </div>

      <div>
        {renderNumber >= 9 && (
          <div onAnimationEnd={() => setRenderNumber(10)}>
            <h5 className="typing-text">
              {examples[2]?.targetPrefix} <b>{examples[2]?.targetTerm}</b>{" "}
              {examples[2]?.targetSuffix}
            </h5>
          </div>
        )}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {renderNumber >= 10 && (
            <div onAnimationEnd={() => setRenderNumber(11)}>
              <h5 className="typing-text">{examples[2]?.sourcePrefix}</h5>
            </div>
          )}
          {renderNumber >= 11 && (
            <div>
              <form
                className="d-flex align-items-center gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                {currentExampleIndex === 0 && !isCorrect3 ? (
                  <input
                    type="text"
                    className="form-control d-inline w-auto"
                    placeholder="..."
                    value={userInput3}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserInput3(value);
                      if (
                        value.trim().toLowerCase() ===
                        examples[2]?.sourceTerm.toLowerCase()
                      ) {
                        setIsCorrect3(true); 
                        setRenderNumber(12); 
                      } else {
                        setIsCorrect3(false); 
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <b className="text-success">{examples[2]?.sourceTerm}</b>
                )}
              </form>
              {currentExampleIndex === 0 && !isCorrect3 && userInput3 && (
                <small className="text-danger">
Try again
                </small>
              )}
              {isCorrect3 && <small className="text-success">✅ Correct!</small>}
            </div>
          )}

          {renderNumber >= 12 && (
            <div onAnimationEnd={() => setRenderNumber(13)}>
              <h5 className="typing-text">{examples[2]?.sourceSuffix}</h5>
            </div>
          )}
        </div>
      </div>

      {renderNumber >= 13 && isCorrect && isCorrect2 && isCorrect3 && (
        <div className="mt-3 alert alert-success">
          
Next Word
        </div>
      )}
    </>
  );
};

export default TextGameCore;
