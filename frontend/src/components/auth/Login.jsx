import React, { useState, useEffect } from "react";
import API from "../../api.js";
import { useAuth } from "../../Authcontext.jsx";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/github-mark-white.svg";
import "./auth.css";

const Login = () => {
  const { logout, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    logout();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await API.post("/login", {
        email,
        password,
      });

      login(res.data.token, res.data.userId);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img className="auth-logo" src={logo} alt="GitHub Logo" />
          <h1 className="auth-title">Sign in to GitHub</h1>
        </div>

        <div className="auth-card">
          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>

            <div className="form-field">
              <div className="label-row">
                <label htmlFor="password">Password</label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <div className="auth-footer-box">
          <p>
            New to GitHub? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;