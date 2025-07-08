import React, { useEffect } from "react";
import { FaVolumeUp } from "react-icons/fa";

const Speak = ({
  word,
  lang = "en-us",
  auto = false,
  showButton = false,
  delay = 0,
  className = "",
  size = 18,
}) => {
  const speak = () => {
    if (!word) return;
    const url = `http://localhost:5000/speak/${encodeURIComponent(
      word
    )}?lang=${lang}`;
    const audio = new Audio(url);
    audio.play();
  };

  useEffect(() => {
    if (auto && word) {
      const timeout = setTimeout(() => speak(), delay);
      return () => clearTimeout(timeout);
    }
  }, [auto, word, delay]);

  return showButton ? (
    <button
      className={`btn btn-sm btn-outline-secondary ${className}`}
      title={`Play: ${word}`}
      onClick={speak}
    >
      <FaVolumeUp size={size} />
    </button>
  ) : null;
};

export default Speak;

// ///example
// import Speak from "../../components/Speak";

// // просто озвучить слово при загрузке:
{
  /* <Speak word="apple" auto /> */
}
{
  /* <Speak word="apple" showButton />; */
}
{
  /* <Speak word="apple" auto showButton /> */
}

//
