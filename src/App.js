import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Courses from "./pages/Courses";
import CourseLessons from "./pages/CourseLessons";
import Lesson from "./pages/Lesson";
import GameMemoCard from "./pages/GameMemoCard";
import GamePuzzle from "./pages/GamePuzzle";
import AddWord from "./pages/AddWord";
import DailyGames from "./components/DailyGames";
import GrammarCourses from "./pages/GrammarCourses";
import GrammarCourseLessons from "./pages/GrammarCourseLessons";
import GrammarLesson from "./pages/GrammarLesson";
import GrammarGame from "./components/GrammarGame";
import GrammarManualImport from "./pages/GrammarManualImport";
import GrammarBulkImport from "./pages/GrammarBulkImport";
import VocabularyBulkImport from "./pages/VocabularyBulkImport.jsx";
import VocabularyManualImport from "./pages/VocabularyManualImport.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mt-4">
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
              path="/game-memo/course/:courseName/lesson/:lessonName"
              element={
                <ProtectedRoute>
                  <GameMemoCard />
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
                  <GamePuzzle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseName/lesson/:lessonName"
              element={
                <ProtectedRoute>
                  <Lesson />
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
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
