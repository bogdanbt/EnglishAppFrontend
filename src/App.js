import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DailyGames from "./components/DailyGames";
import LessonRevision from "./components/LessonRevision";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Vocabulary section
import Courses from "./pages/vocabulary/Courses";
import CourseLessons from "./pages/vocabulary/CourseLessons";
import VocabularyLesson from "./pages/vocabulary/VocabularyLesson";
import VocabularyGamePuzzle from "./pages/vocabulary/VocabularyGamePuzzle";
import VocabularyBulkImport from "./pages/vocabulary/VocabularyBulkImport";
import VocabularyManualImport from "./pages/vocabulary/VocabularyManualImport";

// Grammar section
import GrammarCourses from "./pages/grammar/GrammarCourses";
import GrammarCourseLessons from "./pages/grammar/GrammarCourseLessons";
import GrammarLesson from "./pages/grammar/GrammarLesson";
import GrammarGame from "./components/GrammarGame";
import GrammarBulkImport from "./pages/grammar/GrammarBulkImport";
import GrammarManualImport from "./pages/grammar/GrammarManualImport";

import "./index.css";
import "./style.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container-fluid m-0 p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/grammar"
              element={
                <ProtectedRoute>
                  <GrammarCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grammar-course/:courseGrammarName"
              element={
                <ProtectedRoute>
                  <GrammarCourseLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grammar-course/:courseGrammarName/lesson/:lessonGrammarName"
              element={
                <ProtectedRoute>
                  <GrammarLesson />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revision/course/:courseName/lesson/:lessonName"
              element={<LessonRevision />}
            />
            <Route
              path="/grammar-course/:courseGrammarName/lesson/:lessonGrammarName/game"
              element={
                <ProtectedRoute>
                  <GrammarGame />
                </ProtectedRoute>
              }
            />

            <Route
              path="/course/:courseName"
              element={
                <ProtectedRoute>
                  <CourseLessons />
                </ProtectedRoute>
              }
            />

            <Route
              path="/daily-games/course/:courseName/lesson/:lessonName"
              element={
                <ProtectedRoute>
                  <DailyGames />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-puzzle/course/:courseName/lesson/:lessonName"
              element={
                <ProtectedRoute>
                  <VocabularyGamePuzzle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseName/lesson/:lessonName"
              element={
                <ProtectedRoute>
                  <VocabularyLesson />
                </ProtectedRoute>
              }
            />

            <Route
              path="/import-grammar"
              element={
                <ProtectedRoute>
                  <GrammarManualImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import-grammar-extended"
              element={
                <ProtectedRoute>
                  <GrammarBulkImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import-vocabulary-extended"
              element={
                <ProtectedRoute>
                  <VocabularyBulkImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import-vocabulary"
              element={
                <ProtectedRoute>
                  <VocabularyManualImport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vocabulary"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
