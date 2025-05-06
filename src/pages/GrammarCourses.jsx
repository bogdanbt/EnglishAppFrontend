import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";

const GrammarCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchGrammarCourses = async () => {
      try {
        const response = await API.get(`/grammar-courses/${user.id}`);
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Failed to load grammar courses:", error);
      }
    };

    fetchGrammarCourses();
  }, [user]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Grammar Courses</h2>

      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/import-grammar")}
        >
          Import
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="text-center mt-4">
          You don't have any grammar courses yet.
        </p>
      ) : (
        <div className="row">
          {courses.map((course, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm">
                <h5 className="text-center">{course}</h5>
                <Link
                  to={`/grammar-course/${encodeURIComponent(course)}`}
                  className="btn btn-outline-primary mt-2"
                >
                  Go to Lessons
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarCourses;
