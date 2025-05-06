
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isAuth, logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const closeNavbar = () => setIsCollapsed(true);

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: "#faca66",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="container">
        <Link
          className="navbar-brand"
          to="/"
          onClick={closeNavbar}
          style={{
            fontWeight: 700,
            fontSize: "1.8rem",
            color: "#f7f9f7",
          }}
        >
          Vocally
        </Link>

        <button className="navbar-toggler" type="button" onClick={toggleNavbar}>
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${!isCollapsed ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            {isAuth && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/grammar" onClick={closeNavbar}>
                    Grammar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/vocabulary" onClick={closeNavbar}>
                    Vocabulary
                  </Link>
                </li>
              </>
            )}
            {!isAuth ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeNavbar}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={closeNavbar}>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-danger" onClick={logout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
