import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

// =========================================================
// FALLBACK SKILLS
// =========================================================

const defaultSkills = [
  { name: "Java", level: 85 },
  { name: "SQL", level: 75 },
  { name: "JavaScript", level: 65 },
  { name: "Git", level: 60 },
];

// =========================================================
// INDUSTRY REQUIREMENTS
// =========================================================

const skillRequirements = {
  Java: 80,
  SQL: 70,
  JavaScript: 75,
  Git: 70,
  "Data Structures": 75,
  "REST API": 70,
  "Spring Boot": 70,
  Docker: 60,
};

function StudentDashboard() {
  // =======================================================
  // USER
  // =======================================================

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Student");

  // =======================================================
  // DATA
  // =======================================================

  const [skills, setSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);

  // =======================================================
  // LOADING / ERROR
  // =======================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =======================================================
  // LOAD USER
  // =======================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("aisipUser");

      if (!savedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      if (parsedUser?.id) {
        setUserId(
          Number(parsedUser.id)
        );
      }

      if (parsedUser?.name) {
        setUserName(
          parsedUser.name
        );
      }
    } catch (error) {
      console.error(
        "Could not load user:",
        error
      );
    }
  }, []);

  // =======================================================
  // LOAD DASHBOARD DATA
  // =======================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          "X-User-Id":
            String(userId),
        };

        // ---------------------------------------------------
        // SKILLS
        // ---------------------------------------------------

        const skillsResponse =
          await fetch(
            "http://localhost:5000/api/skills",
            {
              method: "GET",
              headers,
            }
          );

        const skillsData =
          await skillsResponse.json();

        if (!skillsResponse.ok) {
          throw new Error(
            skillsData.message ||
              "Failed to load skills."
          );
        }

        setSkills(
          Array.isArray(skillsData)
            ? skillsData
            : []
        );

        // ---------------------------------------------------
        // OPPORTUNITIES
        // ---------------------------------------------------

        const opportunitiesResponse =
          await fetch(
            "http://localhost:5000/api/internships",
            {
              method: "GET",
              headers,
            }
          );

        const opportunitiesData =
          await opportunitiesResponse.json();

        if (!opportunitiesResponse.ok) {
          throw new Error(
            opportunitiesData.message ||
              "Failed to load opportunities."
          );
        }

        setOpportunities(
          Array.isArray(
            opportunitiesData
          )
            ? opportunitiesData
            : []
        );

        // ---------------------------------------------------
        // APPLICATIONS
        // ---------------------------------------------------

        const applicationsResponse =
          await fetch(
            "http://localhost:5000/api/applications",
            {
              method: "GET",
              headers,
            }
          );

        const applicationsData =
          await applicationsResponse.json();

        if (!applicationsResponse.ok) {
          throw new Error(
            applicationsData.message ||
              "Failed to load applications."
          );
        }

        setApplications(
          Array.isArray(
            applicationsData
          )
            ? applicationsData
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setError(
          error.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  // =======================================================
  // DISPLAY SKILLS
  // =======================================================

  const displaySkills =
    skills.length > 0
      ? skills
      : defaultSkills;

  // =======================================================
  // GET SKILL LEVEL
  // =======================================================

  const getSkillLevel = (
    skillName
  ) => {
    const skill =
      displaySkills.find(
        (item) =>
          String(item.name)
            .toLowerCase() ===
          String(skillName)
            .toLowerCase()
      );

    return skill
      ? Number(skill.level)
      : 0;
  };

  // =======================================================
  // READINESS
  // =======================================================

  const readiness = useMemo(() => {
    const requirements =
      Object.entries(
        skillRequirements
      );

    if (
      requirements.length === 0
    ) {
      return 0;
    }

    let total = 0;

    requirements.forEach(
      ([skillName, requiredLevel]) => {
        const currentLevel =
          getSkillLevel(
            skillName
          );

        const percentage =
          Math.min(
            (currentLevel /
              requiredLevel) *
              100,
            100
          );

        total += percentage;
      }
    );

    return Math.round(
      total /
        requirements.length
    );
  }, [skills]);

  // =======================================================
  // MISSING SKILLS
  // =======================================================

  const missingSkills =
    useMemo(() => {
      return Object.entries(
        skillRequirements
      )
        .filter(
          ([skillName, requiredLevel]) =>
            getSkillLevel(
              skillName
            ) < requiredLevel
        )
        .sort(
          (a, b) => {
            const gapA =
              a[1] -
              getSkillLevel(
                a[0]
              );

            const gapB =
              b[1] -
              getSkillLevel(
                b[0]
              );

            return gapB - gapA;
          }
        )
        .slice(0, 3)
        .map(
          ([skillName]) =>
            skillName
        );
    }, [skills]);

  // =======================================================
  // BEST OPPORTUNITY
  // =======================================================

  const bestOpportunity =
    useMemo(() => {
      if (
        opportunities.length ===
        0
      ) {
        return null;
      }

      return [...opportunities].sort(
        (a, b) =>
          Number(
            b.match || 0
          ) -
          Number(
            a.match || 0
          )
      )[0];
    }, [opportunities]);

  // =======================================================
  // TOP OPPORTUNITIES
  // =======================================================

  const topOpportunities =
    useMemo(() => {
      return [...opportunities]
        .sort(
          (a, b) =>
            Number(
              b.match || 0
            ) -
            Number(
              a.match || 0
            )
        )
        .slice(0, 4);
    }, [opportunities]);

  // =======================================================
  // APPLICATION COUNTS
  // =======================================================

  const appliedCount =
    applications.filter(
      (item) =>
        item.status ===
        "applied"
    ).length;

  const reviewingCount =
    applications.filter(
      (item) =>
        item.status ===
        "reviewing"
    ).length;

  const shortlistedCount =
    applications.filter(
      (item) =>
        item.status ===
        "shortlisted"
    ).length;

  const selectedCount =
    applications.filter(
      (item) =>
        item.status ===
        "selected"
    ).length;

  // =======================================================
  // RECENT APPLICATIONS
  // =======================================================

  const recentApplications =
    applications.slice(0, 4);

  // =======================================================
  // READINESS MESSAGE
  // =======================================================

  const readinessMessage =
    readiness >= 80
      ? "Your profile is strongly aligned with current industry requirements."
      : readiness >= 60
        ? "Your foundation is good. A few targeted improvements can strengthen your profile."
        : "Focus on the highest-impact skill gaps to improve your career readiness.";

  // =======================================================
  // STATUS CLASS
  // =======================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "selected":
        return "dash-status-selected";

      case "shortlisted":
        return "dash-status-shortlisted";

      case "reviewing":
        return "dash-status-reviewing";

      case "rejected":
        return "dash-status-rejected";

      default:
        return "dash-status-applied";
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="dashboard dashboard-v2">

        <Sidebar />

        <div className="dashboard-main">

          <main className="dashboard-content">

            <div className="dashboard-v2-loading">

              <div className="loading-ai-ring">
                <span>AI</span>
              </div>

              <h3>
                Building your career dashboard
              </h3>

              <p>
                AISIP is analyzing your skills,
                matches and applications...
              </p>

            </div>

          </main>

        </div>

      </div>
    );
  }

  return (
    <div className="dashboard dashboard-v2">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="dashboard-main">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="dashboard-v2-topbar">

          <div>

            <span className="dash-top-kicker">
              AISIP STUDENT COMMAND CENTER
            </span>

            <h2>
              Good day,{" "}
              <strong>
                {userName.split(" ")[0]}
              </strong>
            </h2>

            <p>
              Your skills, opportunities and career
              progress — all in one place.
            </p>

          </div>

          <div className="dashboard-profile-chip">

            <div className="dashboard-profile-avatar">
              {userName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {userName}
              </strong>

              <span>
                Student
              </span>
            </div>

          </div>

        </header>

        <main className="dashboard-content">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="dashboard-v2-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {/* =================================================
              MAIN HERO
          ================================================= */}

          <section className="dashboard-command-hero">

            <div className="command-hero-copy">

              <div className="command-ai-badge">
                <span></span>
                AI-POWERED CAREER ENGINE
              </div>

              <h1>
                Turn your skills into
                <br />
                <span>
                  real opportunities.
                </span>
              </h1>

              <p>
                AISIP analyzes your skill profile,
                compares it with industry requirements
                and helps you find roles where you
                have the strongest potential.
              </p>

              <div className="command-hero-actions">

                <Link
                  to="/internships"
                  className="command-primary-btn"
                >
                  Explore Matches
                  <span>→</span>
                </Link>

                <Link
                  to="/ai-recommendations"
                  className="command-secondary-btn"
                >
                  ✦ AI Recommendations
                </Link>

              </div>

            </div>

            {/* READINESS WIDGET */}

            <div className="command-readiness-widget">

              <div className="readiness-widget-title">
                <span>
                  INDUSTRY READINESS
                </span>

                <div className="readiness-ai-dot">
                  AI
                </div>
              </div>

              <div
                className="big-readiness-ring"
                style={{
                  "--dash-readiness":
                    readiness,
                }}
              >

                <div>

                  <strong>
                    {readiness}%
                  </strong>

                  <span>
                    readiness
                  </span>

                </div>

              </div>

              <p>
                {readiness >= 75
                  ? "Strong profile"
                  : readiness >= 55
                    ? "Good foundation"
                    : "Keep improving"}
              </p>

            </div>

          </section>

          {/* =================================================
              QUICK STATS
          ================================================= */}

          <section className="dashboard-v2-stat-grid">

            <div className="dashboard-v2-stat-card">

              <div className="v2-stat-icon blue">
                ✦
              </div>

              <div>

                <span>
                  SKILLS
                </span>

                <strong>
                  {skills.length}
                </strong>

                <small>
                  In your portfolio
                </small>

              </div>

            </div>

            <div className="dashboard-v2-stat-card">

              <div className="v2-stat-icon violet">
                ◉
              </div>

              <div>

                <span>
                  READINESS
                </span>

                <strong>
                  {readiness}%
                </strong>

                <small>
                  Industry alignment
                </small>

              </div>

            </div>

            <div className="dashboard-v2-stat-card">

              <div className="v2-stat-icon cyan">
                ↗
              </div>

              <div>

                <span>
                  MATCHES
                </span>

                <strong>
                  {opportunities.length}
                </strong>

                <small>
                  Roles found for you
                </small>

              </div>

            </div>

            <div className="dashboard-v2-stat-card">

              <div className="v2-stat-icon green">
                ✓
              </div>

              <div>

                <span>
                  APPLICATIONS
                </span>

                <strong>
                  {applications.length}
                </strong>

                <small>
                  Career activity
                </small>

              </div>

            </div>

          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="dashboard-quick-actions">

            <div className="quick-actions-heading">

              <div>
                <span>
                  QUICK ACTIONS
                </span>

                <h3>
                  What's your next move?
                </h3>
              </div>

            </div>

            <div className="quick-actions-grid">

              <Link
                to="/skills"
                className="quick-action-card"
              >

                <div className="quick-action-icon blue">
                  +
                </div>

                <div>
                  <strong>
                    Update Skills
                  </strong>

                  <span>
                    Improve your portfolio
                  </span>
                </div>

                <b>→</b>

              </Link>

              <Link
                to="/skill-gap"
                className="quick-action-card"
              >

                <div className="quick-action-icon violet">
                  ◉
                </div>

                <div>
                  <strong>
                    Analyze Skill Gap
                  </strong>

                  <span>
                    See what to learn next
                  </span>
                </div>

                <b>→</b>

              </Link>

              <Link
                to="/internships"
                className="quick-action-card"
              >

                <div className="quick-action-icon cyan">
                  ↗
                </div>

                <div>
                  <strong>
                    Find Opportunities
                  </strong>

                  <span>
                    Explore matched roles
                  </span>
                </div>

                <b>→</b>

              </Link>

              <Link
                to="/applications"
                className="quick-action-card"
              >

                <div className="quick-action-icon green">
                  ✓
                </div>

                <div>
                  <strong>
                    Track Applications
                  </strong>

                  <span>
                    Follow your progress
                  </span>
                </div>

                <b>→</b>

              </Link>

            </div>

          </section>

          {/* =================================================
              BEST MATCH + SKILLS
          ================================================= */}

          <section className="dashboard-v2-two-column">

            {/* BEST MATCH */}

            <div className="best-match-card">

              <div className="best-match-header">

                <div>

                  <span>
                    TOP AI MATCH
                  </span>

                  <h3>
                    Best opportunity for you
                  </h3>

                </div>

                <div className="best-match-stars">
                  ✦
                </div>

              </div>

              {bestOpportunity ? (

                <>

                  <div className="best-match-company">

                    <div className="best-match-logo">
                      {String(
                        bestOpportunity.company ||
                          "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {bestOpportunity.company ||
                          "Company"}
                      </strong>

                      <span>
                        {bestOpportunity.location ||
                          "Remote"}
                      </span>

                    </div>

                  </div>

                  <h2>
                    {bestOpportunity.title}
                  </h2>

                  <div className="best-match-skills">

                    {Array.isArray(
                      bestOpportunity.skills
                    ) &&
                      bestOpportunity.skills
                        .slice(0, 4)
                        .map(
                          (
                            skill,
                            index
                          ) => (

                            <span
                              key={
                                skill.name ||
                                index
                              }
                            >
                              {typeof skill ===
                              "object"
                                ? skill.name
                                : skill}
                            </span>

                          )
                        )}

                  </div>

                  <div className="best-match-bottom">

                    <div>

                      <span>
                        AI MATCH
                      </span>

                      <strong>
                        {bestOpportunity.match ??
                          0}
                        %
                      </strong>

                    </div>

                    <Link
                      to="/internships"
                      className="best-match-button"
                    >
                      View Opportunity →
                    </Link>

                  </div>

                </>

              ) : (

                <div className="dashboard-empty-small">

                  <div>
                    ↗
                  </div>

                  <strong>
                    No opportunities found
                  </strong>

                  <span>
                    Add skills to discover matches.
                  </span>

                </div>

              )}

            </div>

            {/* SKILLS */}

            <div className="dashboard-v2-panel">

              <div className="v2-panel-heading">

                <div>

                  <span>
                    SKILL PORTFOLIO
                  </span>

                  <h3>
                    Your strongest skills
                  </h3>

                </div>

                <Link
                  to="/skills"
                >
                  Manage →
                </Link>

              </div>

              <div className="dashboard-skill-bars">

                {displaySkills
                  .slice(0, 5)
                  .map(
                    (skill) => (

                      <div
                        className="dashboard-skill-row"
                        key={
                          skill.id ||
                          skill.name
                        }
                      >

                        <div>

                          <span>
                            {skill.name}
                          </span>

                          <strong>
                            {skill.level}%
                          </strong>

                        </div>

                        <div className="dashboard-skill-track">

                          <div
                            style={{
                              width: `${Math.min(
                                Number(
                                  skill.level
                                ) || 0,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    )
                  )}

              </div>

              <div className="skill-profile-footer">

                <span>
                  {missingSkills.length} priority gaps
                </span>

                <Link to="/skill-gap">
                  Analyze →
                </Link>

              </div>

            </div>

          </section>

          {/* =================================================
              APPLICATION JOURNEY
          ================================================= */}

          <section className="dashboard-v2-panel applications-dashboard-panel">

            <div className="v2-panel-heading">

              <div>

                <span>
                  APPLICATION JOURNEY
                </span>

                <h3>
                  Where your applications stand
                </h3>

              </div>

              <Link
                to="/applications"
              >
                View all →
              </Link>

            </div>

            <div className="application-journey-grid">

              <div className="journey-stage">

                <div className="journey-number blue">
                  {appliedCount}
                </div>

                <div>

                  <strong>
                    Applied
                  </strong>

                  <span>
                    Submitted applications
                  </span>

                </div>

              </div>

              <div className="journey-arrow">
                →
              </div>

              <div className="journey-stage">

                <div className="journey-number yellow">
                  {reviewingCount}
                </div>

                <div>

                  <strong>
                    Reviewing
                  </strong>

                  <span>
                    Under consideration
                  </span>

                </div>

              </div>

              <div className="journey-arrow">
                →
              </div>

              <div className="journey-stage">

                <div className="journey-number violet">
                  {shortlistedCount}
                </div>

                <div>

                  <strong>
                    Shortlisted
                  </strong>

                  <span>
                    Potential next step
                  </span>

                </div>

              </div>

              <div className="journey-arrow">
                →
              </div>

              <div className="journey-stage">

                <div className="journey-number green">
                  {selectedCount}
                </div>

                <div>

                  <strong>
                    Selected
                  </strong>

                  <span>
                    Successful outcomes
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              RECOMMENDED OPPORTUNITIES
          ================================================= */}

          <section className="dashboard-v2-panel">

            <div className="v2-panel-heading">

              <div>

                <span>
                  AI RECOMMENDATIONS
                </span>

                <h3>
                  Opportunities worth exploring
                </h3>

                <p>
                  Ranked by your current skill alignment.
                </p>

              </div>

              <Link
                to="/internships"
              >
                Explore all →
              </Link>

            </div>

            <div className="dashboard-opportunity-grid">

              {topOpportunities.map(
                (opportunity) => (

                  <div
                    className="dashboard-opportunity-item"
                    key={
                      opportunity.id
                    }
                  >

                    <div className="dashboard-opportunity-top">

                      <div className="dashboard-company-logo">
                        {String(
                          opportunity.company ||
                            "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="dashboard-match-badge">

                        <strong>
                          {opportunity.match ??
                            0}
                          %
                        </strong>

                        <span>
                          match
                        </span>

                      </div>

                    </div>

                    <span className="dashboard-opportunity-type">
                      {opportunity.type ||
                        "Internship"}
                    </span>

                    <h4>
                      {opportunity.title}
                    </h4>

                    <p>
                      {opportunity.company ||
                        "Company"}

                      <span>
                        •
                      </span>

                      {opportunity.location ||
                        "Remote"}
                    </p>

                    <div className="dashboard-opportunity-tags">

                      {Array.isArray(
                        opportunity.skills
                      ) &&
                        opportunity.skills
                          .slice(0, 3)
                          .map(
                            (
                              skill,
                              index
                            ) => (

                              <span
                                key={
                                  skill.name ||
                                  index
                                }
                              >
                                {typeof skill ===
                                "object"
                                  ? skill.name
                                  : skill}
                              </span>

                            )
                          )}

                    </div>

                    <Link
                      to="/internships"
                      className="dashboard-opportunity-link"
                    >
                      View role →
                    </Link>

                  </div>

                )
              )}

              {topOpportunities.length ===
                0 && (

                <div className="dashboard-full-empty">

                  <div>
                    ↗
                  </div>

                  <h4>
                    No matching roles yet
                  </h4>

                  <p>
                    Add skills and explore opportunities
                    to start building your match profile.
                  </p>

                  <Link
                    to="/skills"
                  >
                    Add Skills →
                  </Link>

                </div>

              )}

            </div>

          </section>

          {/* =================================================
              RECENT APPLICATIONS + AI INSIGHT
          ================================================= */}

          <section className="dashboard-v2-two-column">

            {/* RECENT APPLICATIONS */}

            <div className="dashboard-v2-panel">

              <div className="v2-panel-heading">

                <div>

                  <span>
                    RECENT ACTIVITY
                  </span>

                  <h3>
                    Latest applications
                  </h3>

                </div>

                <Link to="/applications">
                  View all →
                </Link>

              </div>

              {recentApplications.length ===
              0 ? (

                <div className="dashboard-empty-small">

                  <div>
                    📋
                  </div>

                  <strong>
                    No applications yet
                  </strong>

                  <span>
                    Start exploring your matched roles.
                  </span>

                  <Link to="/internships">
                    Find Opportunities →
                  </Link>

                </div>

              ) : (

                <div className="dashboard-application-list">

                  {recentApplications.map(
                    (application) => (

                      <div
                        className="dashboard-application-row"
                        key={
                          application.id
                        }
                      >

                        <div className="application-row-logo">
                          {String(
                            application.company ||
                              "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="application-row-info">

                          <strong>
                            {
                              application.internshipTitle ||
                              application.title ||
                              "Opportunity"
                            }
                          </strong>

                          <span>
                            {
                              application.company ||
                              "Company"
                            }
                          </span>

                        </div>

                        <span
                          className={`dashboard-status ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {
                            application.status ||
                            "applied"
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            {/* AI INSIGHT */}

            <div className="dashboard-career-insight">

              <div className="career-insight-top">

                <div className="career-insight-icon">
                  ✦
                </div>

                <span>
                  AISIP AI INSIGHT
                </span>

              </div>

              <h3>
                {missingSkills.length > 0
                  ? `Your highest-impact next skill is ${missingSkills[0]}.`
                  : "Your current profile is looking strong."}
              </h3>

              <p>
                {missingSkills.length > 0
                  ? `Strengthening ${missingSkills[0]} could improve your alignment with more industry roles and strengthen your overall readiness.`
                  : "Keep your skills updated and continue exploring opportunities aligned with your career goals."}
              </p>

              <div className="career-insight-divider"></div>

              <div className="career-insight-footer">

                <span>
                  {readiness}% career readiness
                </span>

                <Link to="/skill-gap">
                  See Analysis →
                </Link>

              </div>

            </div>

          </section>

          {/* =================================================
              FINAL CTA
          ================================================= */}

          <section className="dashboard-final-cta">

            <div>

              <span>
                YOUR NEXT MOVE
              </span>

              <h3>
                {missingSkills.length > 0
                  ? `Close your ${missingSkills[0]} gap and unlock better matches.`
                  : "Keep building skills and discovering opportunities."}
              </h3>

              <p>
                AISIP continuously connects your
                skills with what industry is looking for.
              </p>

            </div>

            <Link
              to="/ai-recommendations"
              className="dashboard-final-cta-button"
            >
              View AI Recommendations →
            </Link>

          </section>

        </main>

      </div>

    </div>
  );
}

export default StudentDashboard;