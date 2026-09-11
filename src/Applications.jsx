import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET LOGGED-IN USER ID
  // =========================================================

  const getUserId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("aisipUser")
      );

      return user?.id ? Number(user.id) : null;
    } catch (error) {
      console.error(
        "Could not read logged-in user:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // COMMON HEADERS
  // =========================================================

  const getHeaders = () => {
    const userId = getUserId();

    return {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    };
  };

  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      if (!userId) {
        throw new Error(
          "User is not logged in."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load applications."
        );
      }

      setApplications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Could not load applications:",
        error
      );

      if (
        error.message ===
        "User is not logged in."
      ) {
        setError("Please login first.");
      } else {
        setError(
          error.message ||
            "Cannot connect to the backend. Please make sure the backend server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD APPLICATIONS WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadApplications();
  }, []);

  // =========================================================
  // APPLICATION STATISTICS
  // =========================================================

  const applicationStats = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (application) =>
          application.status === "applied"
      ).length,

      reviewing: applications.filter(
        (application) =>
          application.status === "reviewing"
      ).length,

      shortlisted:
        applications.filter(
          (application) =>
            application.status ===
            "shortlisted"
        ).length,

      selected: applications.filter(
        (application) =>
          application.status === "selected"
      ).length,

      rejected: applications.filter(
        (application) =>
          application.status === "rejected"
      ).length,
    };
  }, [applications]);

  // =========================================================
  // STATUS INFORMATION
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "selected":
        return "application-status-selected";

      case "shortlisted":
        return "application-status-shortlisted";

      case "reviewing":
        return "application-status-reviewing";

      case "rejected":
        return "application-status-rejected";

      default:
        return "application-status-applied";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "selected":
        return "✓";

      case "shortlisted":
        return "★";

      case "reviewing":
        return "◌";

      case "rejected":
        return "×";

      default:
        return "↗";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page premium-applications-page">

        <Sidebar />

        <div className="profile-main">

          <main className="profile-content">

            <section className="applications-loading-card">

              <div className="applications-loading-orb">
                ✓
              </div>

              <div>
                <h3>
                  Loading your applications...
                </h3>

                <p>
                  Getting your latest career activity
                  ready.
                </p>
              </div>

            </section>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="profile-page premium-applications-page">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <div className="profile-main">

        <main className="profile-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="applications-hero">

            <div className="applications-hero-content">

              <span className="applications-kicker">
                APPLICATION CENTER
              </span>

              <h1>
                Track your{" "}
                <span>
                  career journey.
                </span>
              </h1>

              <p>
                Keep an eye on every application,
                understand where you stand and stay
                focused on your next opportunity.
              </p>

              <div className="application-hero-stats">

                <div>
                  <strong>
                    {applicationStats.total}
                  </strong>

                  <span>
                    Total
                  </span>
                </div>

                <div>
                  <strong>
                    {applicationStats.reviewing}
                  </strong>

                  <span>
                    Reviewing
                  </span>
                </div>

                <div>
                  <strong>
                    {applicationStats.shortlisted}
                  </strong>

                  <span>
                    Shortlisted
                  </span>
                </div>

                <div>
                  <strong>
                    {applicationStats.selected}
                  </strong>

                  <span>
                    Selected
                  </span>
                </div>

              </div>

            </div>

            <div className="applications-hero-visual">

              <div className="application-orbit application-orbit-one"></div>

              <div className="application-orbit application-orbit-two"></div>

              <div className="application-hero-core">

                <span>
                  AISIP
                </span>

                <strong>
                  TRACK
                </strong>

              </div>

              <div className="application-floating-card application-floating-one">
                <span>Applied</span>
                <strong>
                  {applicationStats.applied}
                </strong>
              </div>

              <div className="application-floating-card application-floating-two">
                <span>Selected</span>
                <strong>
                  {applicationStats.selected}
                </strong>
              </div>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="applications-error">

              <span>
                !
              </span>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              STATUS OVERVIEW
          ================================================= */}

          <section className="applications-overview-card">

            <div className="applications-section-heading">

              <div>

                <span>
                  APPLICATION OVERVIEW
                </span>

                <h3>
                  Your application pipeline
                </h3>

                <p>
                  A quick look at your current
                  application statuses.
                </p>

              </div>

            </div>

            <div className="application-pipeline">

              <div className="pipeline-step">

                <div className="pipeline-icon applied">
                  ↗
                </div>

                <div>
                  <strong>
                    {applicationStats.applied}
                  </strong>

                  <span>
                    Applied
                  </span>
                </div>

              </div>

              <div className="pipeline-connector"></div>

              <div className="pipeline-step">

                <div className="pipeline-icon reviewing">
                  ◌
                </div>

                <div>
                  <strong>
                    {applicationStats.reviewing}
                  </strong>

                  <span>
                    Reviewing
                  </span>
                </div>

              </div>

              <div className="pipeline-connector"></div>

              <div className="pipeline-step">

                <div className="pipeline-icon shortlisted">
                  ★
                </div>

                <div>
                  <strong>
                    {applicationStats.shortlisted}
                  </strong>

                  <span>
                    Shortlisted
                  </span>
                </div>

              </div>

              <div className="pipeline-connector"></div>

              <div className="pipeline-step">

                <div className="pipeline-icon selected">
                  ✓
                </div>

                <div>
                  <strong>
                    {applicationStats.selected}
                  </strong>

                  <span>
                    Selected
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              APPLICATION LIST
          ================================================= */}

          <section className="applications-list-section">

            <div className="applications-section-heading">

              <div>

                <span>
                  YOUR ACTIVITY
                </span>

                <h3>
                  Recent Applications
                </h3>

                <p>
                  Your submitted internship and job
                  applications.
                </p>

              </div>

              <Link
                to="/internships"
                className="applications-browse-button"
              >
                Find More Opportunities →
              </Link>

            </div>

            {applications.length === 0 ? (

              <div className="applications-empty">

                <div className="applications-empty-icon">
                  📋
                </div>

                <h4>
                  No applications yet
                </h4>

                <p>
                  Start exploring opportunities that
                  match your skills and career goals.
                </p>

                <Link
                  to="/internships"
                  className="applications-empty-button"
                >
                  Explore Opportunities →
                </Link>

              </div>

            ) : (

              <div className="premium-application-cards">

                {applications.map(
                  (application) => {

                    const title =
                      application.internshipTitle ||
                      application.title ||
                      "Internship";

                    const company =
                      application.company ||
                      "Company";

                    const location =
                      application.location ||
                      "Location";

                    const status =
                      application.status ||
                      "applied";

                    const companyInitial =
                      company
                        .charAt(0)
                        .toUpperCase();

                    return (
                      <article
                        className="premium-application-card"
                        key={
                          application.id
                        }
                      >

                        {/* TOP */}

                        <div className="application-card-top">

                          <div className="application-company-logo">

                            {companyInitial || "C"}

                          </div>

                          <div className="application-card-status">

                            <span
                              className={`application-status-icon ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusIcon(
                                status
                              )}
                            </span>

                            <span
                              className={`application-status-text ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>

                          </div>

                        </div>

                        {/* INFO */}

                        <div className="application-card-info">

                          <h3>
                            {title}
                          </h3>

                          <p>
                            {company}
                            <span>
                              •
                            </span>
                            {location}
                          </p>

                        </div>

                        {/* DETAILS */}

                        <div className="application-card-details">

                          <div>

                            <span>
                              APPLICATION ID
                            </span>

                            <strong>
                              #{application.id}
                            </strong>

                          </div>

                          <div>

                            <span>
                              STATUS
                            </span>

                            <strong>
                              {status}
                            </strong>

                          </div>

                        </div>

                        {/* FOOTER */}

                        <div className="application-card-footer">

                          <span>
                            Keep tracking your progress
                          </span>

                          <Link
                            to="/internships"
                          >
                            Explore similar roles →
                          </Link>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* =================================================
              CAREER TIPS
          ================================================= */}

          <section className="application-bottom-grid">

            <div className="application-tip-card">

              <div className="application-tip-icon">
                ✦
              </div>

              <span>
                AISIP TIP
              </span>

              <h3>
                Keep applying strategically.
              </h3>

              <p>
                Focus on roles where your current
                skills have a strong match instead
                of applying everywhere.
              </p>

            </div>

            <div className="application-next-card">

              <span>
                NEXT STEP
              </span>

              <h3>
                Strengthen your profile.
              </h3>

              <p>
                Update your skills and use AISIP's
                Skill Gap Analysis to improve your
                future matches.
              </p>

              <Link to="/skill-gap">
                Analyze Skill Gap →
              </Link>

            </div>

          </section>

          {/* =================================================
              FINAL AI BANNER
          ================================================= */}

          <section className="applications-ai-banner">

            <div className="applications-ai-icon">
              ✦
            </div>

            <div className="applications-ai-content">

              <span>
                AISIP CAREER ENGINE
              </span>

              <h3>
                Your next opportunity is closer than you think.
              </h3>

              <p>
                Keep improving your skills, exploring
                relevant roles and tracking your progress.
                AISIP brings the whole journey together.
              </p>

            </div>

            <Link
              to="/ai-recommendations"
              className="applications-ai-button"
            >
              Get AI Recommendations →
            </Link>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Applications;