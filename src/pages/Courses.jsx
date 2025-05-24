import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import "../styles/Courses.css"; // Add this line

const colorClasses = [
  "bg-pink",
  "bg-yellow",
  "bg-orange",
  "bg-purple",
  "bg-light-blue",
];

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchCourses = async () => {
      try {
        const response = await API.get(`/courses/${user.id}`);
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };

    fetchCourses();
  }, [user]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Your Courses</h2>

      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/import-vocabulary")}
        >
          Import
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center mt-4">
          <p>
            You don't have any courses yet. Use the import function to upload
            vocabulary.
          </p>
        </div>
      ) : (
        <div className="row justify-content-center">
          {courses.map((course, index) => {
            const bg = colorClasses[index % colorClasses.length];
            return (
              <div
                key={index}
                className="col-12 col-sm-6 col-md-4 mb-4 d-flex justify-content-center"
              >
                <div className={`course-card ${bg}`}>
                  <div className="course-title">{course}</div>
                  <Link
                    to={`/course/${encodeURIComponent(course)}`}
                    className="btn btn-light mt-2"
                  >
                    Open
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

export default Courses;
