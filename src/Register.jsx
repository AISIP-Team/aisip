import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            role: role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      // Save basic user information
      localStorage.setItem(
        "aisipUser",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      setSuccess("Account created successfully!");

      // Go to login page
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        "Cannot connect to the backend. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page premium-auth-page register-auth-page">

      {/* =========================================
          DECORATIVE BACKGROUND
      ========================================= */}

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>
      <div className="auth-grid"></div>

      {/* =========================================
          LEFT SIDE
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

          {/* HERO */}

          <div className="auth-hero-copy">

            <div className="auth-badge">
              <span className="auth-badge-dot"></span>
              Build Your Career
            </div>

            <h2>
              Start your journey.
              <br />
              <span>Shape your future.</span>
            </h2>

            <p>
              Create your AISIP account, showcase your
              skills and discover opportunities that
              align with your career goals.
            </p>

          </div>

          {/* FEATURES */}

          <div className="auth-feature-list">

            <div className="auth-feature-item">

              <div className="auth-feature-icon">
                ✦
              </div>

              <div>
                <strong>Showcase Your Skills</strong>

                <span>
                  Build a profile that highlights what
                  you can do.
                </span>
              </div>

            </div>

            <div className="auth-feature-item">

              <div className="auth-feature-icon">
                ↗
              </div>

              <div>
                <strong>Find Better Opportunities</strong>

                <span>
                  Discover internships and jobs matched
                  to your abilities.
                </span>
              </div>

            </div>

            <div className="auth-feature-item">

              <div className="auth-feature-icon">
                ✓
              </div>

              <div>
                <strong>Track Your Applications</strong>

                <span>
                  Stay organized throughout your career
                  journey.
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="auth-left-footer">
          © 2026 AISIP · Bridging Academia & Industry
        </div>

      </div>

      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="auth-right">

        <div className="login-box premium-login-box register-box">

          {/* HEADING */}

          <div className="login-heading">

            <div className="login-small-badge">
              Get started
            </div>

            <h2>
              Create your account
            </h2>

            <p className="subtitle">
              Join AISIP and take the next step in your
              career journey.
            </p>

          </div>

          {/* FORM */}

          <form onSubmit={handleRegister}>

            {/* NAME */}

            <div className="auth-input-group">

              <label htmlFor="name">
                Full name
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ●
                </span>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>

            </div>

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

              <label htmlFor="password">
                Password
              </label>

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
                  placeholder="Create a password"
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
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-input-group">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  •••
                </span>

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* ROLE */}

            <div className="auth-input-group">

              <label htmlFor="role">
                Register as
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
                </select>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="auth-success">

                <span>✓</span>

                <p>
                  {success}
                </p>

              </div>
            )}

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="login-button premium-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
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

            <p>
              Already registered?
            </p>

            <span></span>

          </div>

          {/* LOGIN */}

          <Link
            to="/login"
            className="auth-register-button"
          >
            Sign in to your account
            <span>→</span>
          </Link>

          {/* HOME */}

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

export default Register;