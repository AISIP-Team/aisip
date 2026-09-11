import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Check selected role
      if (data.user.role !== role) {
        setError(
          `This account is registered as ${data.user.role}. Please select the correct role.`
        );
        return;
      }

      // Save user
      localStorage.setItem(
        "aisipUser",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      // Role based navigation
      if (data.user.role === "student") {
        navigate("/student-dashboard");
      } else if (data.user.role === "company") {
        navigate("/company-dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        setError("This account role is not supported.");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Cannot connect to the backend. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page premium-auth-page">

      {/* =========================================
          DECORATIVE BACKGROUND
      ========================================= */}

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-grid"></div>

      {/* =========================================
          LEFT PANEL
      ========================================= */}

      <div className="auth-left">

        <div className="auth-left-content">

          {/* BRAND */}

          <Link to="/" className="auth-brand">
            <div className="auth-brand-mark">
              A
            </div>

            <div>
              <h1>AISIP</h1>

              <p>
                Academia–Industry Skill
                <br />
                Internship & Placement Portal
              </p>
            </div>
          </Link>

          {/* MAIN MESSAGE */}

          <div className="auth-hero-copy">

            <div className="auth-badge">
              <span className="auth-badge-dot"></span>
              Smart Career Platform
            </div>

            <h2>
              Your skills.
              <br />
              Your opportunities.
              <br />
              <span>Your future.</span>
            </h2>

            <p>
              Connect your academic journey with real
              industry opportunities through
              skill-based matching.
            </p>

          </div>

          {/* MINI FEATURES */}

          <div className="auth-feature-list">

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                ✦
              </div>

              <div>
                <strong>AI Skill Matching</strong>
                <span>
                  Discover opportunities based on your skills.
                </span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                ↗
              </div>

              <div>
                <strong>Internships & Jobs</strong>
                <span>
                  Find roles aligned with your career goals.
                </span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                ✓
              </div>

              <div>
                <strong>Track Your Progress</strong>
                <span>
                  Manage applications from one place.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* LEFT FOOTER */}

        <div className="auth-left-footer">
          © 2026 AISIP · Bridging Academia & Industry
        </div>

      </div>

      {/* =========================================
          RIGHT PANEL
      ========================================= */}

      <div className="auth-right">

        <div className="login-box premium-login-box">

          {/* TOP */}

          <div className="login-heading">

            <div className="login-small-badge">
              Welcome back
            </div>

            <h2>
              Sign in to AISIP
            </h2>

            <p className="subtitle">
              Continue your journey toward the right
              opportunity.
            </p>

          </div>

          {/* FORM */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="auth-input-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="auth-input-group">

              <div className="auth-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  •••
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* ROLE */}

            <div className="auth-input-group">

              <label htmlFor="role">
                Continue as
              </label>

              <div className="auth-input-wrapper role-wrapper">

                <span className="auth-input-icon">
                  ◉
                </span>

                <select
                  id="role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  required
                >
                  <option value="student">
                    Student
                  </option>

                  <option value="company">
                    Company
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="login-button premium-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}
            </button>

          </form>

          {/* DIVIDER */}

          <div className="auth-divider">
            <span></span>
            <p>New to AISIP?</p>
            <span></span>
          </div>

          {/* REGISTER */}

          <Link
            to="/register"
            className="auth-register-button"
          >
            Create an account
            <span>→</span>
          </Link>

          {/* HOME LINK */}

          <Link
            to="/"
            className="auth-home-link"
          >
            ← Back to homepage
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;