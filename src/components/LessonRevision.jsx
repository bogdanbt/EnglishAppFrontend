// LessonRevision.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import KnowledgeTypingGame from "./KnowledgeTypingGame";

const LessonRevision = () => {
  const { user } = useContext(AuthContext);
  const { courseName, lessonName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedLessonName = decodeURIComponent(lessonName);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchWords = async () => {
      try {
        const response = await API.get(
          `/words/${user.id}/${decodedCourseName}/${decodedLessonName}`
        );
        setWords(response.data);
      } catch (error) {
        console.error("Error loading words:", error);
      }
    };

    fetchWords();
  }, [user, decodedCourseName, decodedLessonName]);

  const handleGameComplete = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return <div className="text-center mt-5">All words revised!</div>;
  }

  if (words.length === 0) {
    return <div className="text-center mt-5">Loading words...</div>;
  }

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">
        Revision: {decodedLessonName} ({currentIndex + 1}/{words.length})
      </h3>
      <KnowledgeTypingGame
        word={words[currentIndex].word}
        courseName={decodedCourseName}
        userId={user.id}
        onComplete={handleGameComplete}
      />
    </div>
  );
};

export default LessonRevision;
