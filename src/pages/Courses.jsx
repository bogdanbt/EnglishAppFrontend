// import React, { useEffect, useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import API from "../utils/api";

// const Courses = () => {
//   const { user } = useContext(AuthContext);
//   const [courses, setCourses] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user || !user.id) return;

//     const fetchCourses = async () => {
//       try {
//         const response = await API.get(`/courses/${user.id}`);
//         setCourses(response.data.courses);
//       } catch (error) {
//         console.error("Ошибка загрузки курсов:", error);
//       }
//     };

//     fetchCourses();
//   }, [user]);

//   const goToCourse = (course) => {
//     navigate(`/course/${course}`);
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center">Ваши курсы</h2>
//       {courses.length === 0 ? (
//         <div className="text-center mt-4">
//           <p>У вас пока нет загруженных курсов.</p>
//           <Link to="/settings" className="btn btn-primary">
//             Настройки
//           </Link>
//         </div>
//       ) : (
//         <div className="row">
//           {courses.map((course, index) => (
//             <div key={index} className="col-md-4 mb-4">
//               <div className="card p-3 shadow-sm">
//                 <h5 className="text-center">{course}</h5>
//                 <button
//                   className="btn btn-outline-primary mt-2"
//                   onClick={() => goToCourse(course)}
//                 >
//                   Перейти
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Courses;

import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchCourses = async () => {
      try {
        const response = await API.get(`/courses/${user.id}`);
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
      }
    };

    fetchCourses();
  }, [user]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Ваши курсы</h2>
      {courses.length === 0 ? (
        <div className="text-center mt-4">
          <p>У вас пока нет загруженных курсов.</p>
          <Link to="/settings" className="btn btn-primary">
            Настройки
          </Link>
        </div>
      ) : (
        <div className="row">
          {courses.map((course, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm">
                <h5 className="text-center">{course}</h5>
                <Link
                  to={`/course/${encodeURIComponent(course)}`}
                  className="btn btn-outline-primary mt-2"
                >
                  Перейти
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
