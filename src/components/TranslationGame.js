import React, { useState, useEffect, useRef } from "react";

const TranslationGame = ({ word, translation, onNext }) => {
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setMessage("");
  };

  const checkAnswer = () => {
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedWord = word.trim().toLowerCase();

    if (normalizedInput === normalizedWord) {
      setIsCorrect(true);
      setMessage("Correct!");
      setTimeout(() => {
        onNext();
      }, 1500);
    } else {
      setMessage("Try again");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() === "") {
      setMessage("Please enter a word");
      return;
    }
    checkAnswer();
  };

  const showWordHint = () => {
    setShowHint(true);
  };

  const handleSkip = () => {
    setIsCorrect(true);
    setMessage("Skipped. The correct answer is: " + word);
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  return (
    <div className="translation-game p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Translate the Word</h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Translation:</h3>
        <p className="text-xl">{translation}</p>
      </div>

      {showHint && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-md font-medium mb-1">Hint:</h3>
          <p className="text-lg">{word}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="wordInput" className="block mb-2 font-medium">
            Enter the word:
          </label>
          <input
            ref={inputRef}
            type="text"
            id="wordInput"
            value={userInput}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${
              message === "Correct!"
                ? "border-green-500"
                : message === "Try again" || message.startsWith("Skipped")
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Your answer"
            disabled={isCorrect}
          />
        </div>

        {message && (
          <div
            className={`mb-4 p-2 rounded-md ${
              message === "Correct!"
                ? "bg-green-100 text-green-700"
                : message === "Try again" || message.startsWith("Skipped")
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex-1"
            disabled={isCorrect}
          >
            Check
          </button>

          {!showHint && !isCorrect && (
            <button
              type="button"
              onClick={showWordHint}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md"
            >
              Hint
            </button>
          )}

          {!isCorrect && (
            <button
              type="button"
              onClick={handleSkip}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
            >
              Skip
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TranslationGame;
