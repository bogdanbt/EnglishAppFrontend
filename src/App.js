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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import"
              element={
                <ProtectedRoute>
                  <AddWord />
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
              path="/courses"
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
