import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import "../style.css";

const colorClasses = [
  "bg-pink",
  "bg-yellow",
  "bg-orange",
  "bg-purple",
  "bg-light-blue",
];

const GrammarCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.id) return;

    let retries = 0;

    const fetchGrammarCourses = async () => {
      try {
        const response = await API.get(`/grammar-courses/${user.id}`);
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load grammar courses:", error);
        if (retries < 1) {
          retries++;
          setTimeout(fetchGrammarCourses, 1500); // Retry once after 1.5s
        } else {
          setLoading(false);
        }
      }
    };

    fetchGrammarCourses();
  }, [user]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Grammar Courses</h2>

      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/import-grammar")}
        >
          Add +
        </button>
      </div>

      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : courses.length === 0 ? (
        <p className="text-center mt-4">
          You don't have any grammar courses yet.
        </p>
      ) : (
        <div className="row justify-content-center">
          {courses.map((course, index) => {
            const color = colorClasses[index % colorClasses.length];
            return (
              <div
                key={index}
                className="col-12 col-sm-6 col-md-4 mb-4 d-flex justify-content-center"
              >
                <div className={`grammar-card ${color}`}>
                  <div className="course-title">{course}</div>
                  <Link
                    to={`/grammar-course/${encodeURIComponent(course)}`}
                    className="btn btn-light mt-2"
                  >
                    Go to Lessons
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GrammarCourses;
