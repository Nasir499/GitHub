import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth.js";
import logo from "../assets/github-mark-white.svg";
import "./navbar.css";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="GitHub Logo" className="navbar-logo" />
            <span className="navbar-title">GitHub</span>
          </Link>
        </div>

        <div className="navbar-right">
          <Link to="/create" className="navbar-create-btn">
            <span className="plus-icon">+</span> New
          </Link>
          <Link to="/profile" className="navbar-link">
            Profile
          </Link>
          <button className="navbar-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
