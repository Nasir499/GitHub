import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth.js";
import API from "../api.js";
import logo from "../assets/github-mark-white.svg";
import "./navbar.css";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/allUsers");
        setAllUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching users for navbar search:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const filteredUsers = searchQuery.trim() === ""
    ? []
    : allUsers.filter(u =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="GitHub Logo" className="navbar-logo" />
            <span className="navbar-title">GitHub</span>
          </Link>
        </div>

        {/* User Search Bar */}
        <div className="navbar-center" ref={searchRef}>
          <div className="navbar-search-wrapper">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />

            {showDropdown && searchQuery.trim().length > 0 && (
              <div className="user-search-dropdown">
                {filteredUsers.length === 0 ? (
                  <div className="empty-search-results">No users found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <Link
                      key={user._id}
                      to={`/user/${user._id}`}
                      className="user-search-item"
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className="user-avatar-mini">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info-mini">
                        <span className="user-name-mini">{user.username}</span>
                        <span className="user-email-mini">{user.email}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
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
