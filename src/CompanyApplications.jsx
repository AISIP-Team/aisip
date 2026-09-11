import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function CompanyApplications() {
  // =========================================================
  // LOGGED-IN COMPANY
  // =========================================================

  const getCompanyUser = () => {
    try {
      const savedUser = localStorage.getItem("aisipUser");

      if (!savedUser) return null;

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Could not read logged-in user:", error);
      return null;
    }
  };

  const companyUser = getCompanyUser();

  const COMPANY_USER_ID = companyUser?.id
    ? Number(companyUser.id)
    : null;

  // =========================================================
  // STATE
  // =========================================================

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // HEADERS
  // =========================================================

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "X-User-Id": String(COMPANY_USER_ID),
  });

  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!COMPANY_USER_ID) {
        throw new Error(
          "Please login with a company account first."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/company/applications",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load applications."
        );
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Application load error:", error);

      setError(
        error.message || "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!COMPANY_USER_ID) {
      setError(
        "Please login with a company account first."
      );
      setLoading(false);
      return;
    }

    if (
      companyUser?.role &&
      companyUser.role !== "company"
    ) {
      setError(
        "Please login with a company account to view applications."
      );
      setLoading(false);
      return;
    }

    loadApplications();
  }, []);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
    applicationId,
    newStatus
  ) => {
    try {
      setUpdatingId(applicationId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:5000/api/company/applications/${applicationId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update application."
        );
      }

      setSuccess(
        `Application moved to "${newStatus}".`
      );

      await loadApplications();
    } catch (error) {
      console.error("Status update error:", error);

      setError(
        error.message || "Failed to update application."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (item) => item.status === "applied"
      ).length,

      reviewing: applications.filter(
        (item) => item.status === "reviewing"
      ).length,

      shortlisted: applications.filter(
        (item) => item.status === "shortlisted"
      ).length,

      selected: applications.filter(
        (item) => item.status === "selected"
      ).length,

      rejected: applications.filter(
        (item) => item.status === "rejected"
      ).length,

      averageMatch:
        applications.length > 0
          ? Math.round(
              applications.reduce(
                (sum, item) =>
                  sum + Number(item.matchScore || 0),
                0
              ) / applications.length
            )
          : 0,
    };
  }, [applications]);

  // =========================================================
  // FILTERING
  // =========================================================

  const filteredApplications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return [...applications]
      .filter((application) => {
        const studentName = String(
          application.studentName || ""
        ).toLowerCase();

        const internshipTitle = String(
          application.internshipTitle || ""
        ).toLowerCase();

        const email = String(
          application.email || ""
        ).toLowerCase();

        const matchesSearch =
          !searchText ||
          studentName.includes(searchText) ||
          internshipTitle.includes(searchText) ||
          email.includes(searchText);

        const matchesStatus =
          statusFilter === "all" ||
          application.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          Number(b.matchScore || 0) -
          Number(a.matchScore || 0)
      );
  }, [applications, search, statusFilter]);

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "selected":
        return "company-status-selected";

      case "shortlisted":
        return "company-status-shortlisted";

      case "reviewing":
        return "company-status-reviewing";

      case "rejected":
        return "company-status-rejected";

      default:
        return "company-status-applied";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "selected":
        return "Selected";

      case "shortlisted":
        return "Shortlisted";

      case "reviewing":
        return "Reviewing";

      case "rejected":
        return "Rejected";

      default:
        return "Applied";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="company-applications-page">
        <Sidebar />

        <div className="company-applications-main">
          <div className="company-loading-screen">
            <div className="company-loading-orb">
              AI
            </div>

            <h3>
              Loading candidate pipeline
            </h3>

            <p>
              Fetching student applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="company-applications-page">
      <Sidebar />

      <div className="company-applications-main">
        <main className="company-applications-content">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="company-applications-hero">

            <div className="company-applications-hero-text">
              <span className="company-eyebrow">
                AISIP CANDIDATE CENTER
              </span>

              <h1>
                Find the right{" "}
                <em>talent.</em>
              </h1>

              <p>
                Review applicants, compare skill matches
                and move candidates through your hiring
                pipeline.
              </p>
            </div>

            <div className="company-match-highlight">
              <span>
                AVERAGE AI MATCH
              </span>

              <strong>
                {stats.averageMatch}%
              </strong>

              <small>
                across all applicants
              </small>
            </div>
          </section>

          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div className="company-application-alert error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="company-application-alert success">
              <span>✓</span>
              <p>{success}</p>
            </div>
          )}

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <section className="company-application-stats">

            <div className="company-application-stat-card">
              <span className="stat-icon">◈</span>

              <div>
                <small>
                  ALL APPLICATIONS
                </small>

                <strong>
                  {stats.total}
                </strong>

                <p>
                  Total candidates
                </p>
              </div>
            </div>

            <div className="company-application-stat-card">
              <span className="stat-icon">↗</span>

              <div>
                <small>
                  NEW
                </small>

                <strong>
                  {stats.applied}
                </strong>

                <p>
                  Awaiting review
                </p>
              </div>
            </div>

            <div className="company-application-stat-card">
              <span className="stat-icon">◌</span>

              <div>
                <small>
                  REVIEWING
                </small>

                <strong>
                  {stats.reviewing}
                </strong>

                <p>
                  Currently reviewing
                </p>
              </div>
            </div>

            <div className="company-application-stat-card">
              <span className="stat-icon">★</span>

              <div>
                <small>
                  SHORTLISTED
                </small>

                <strong>
                  {stats.shortlisted}
                </strong>

                <p>
                  Strong candidates
                </p>
              </div>
            </div>

            <div className="company-application-stat-card">
              <span className="stat-icon">✓</span>

              <div>
                <small>
                  SELECTED
                </small>

                <strong>
                  {stats.selected}
                </strong>

                <p>
                  Hiring decisions
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              FILTER PANEL
          ================================================= */}

          <section className="company-application-controls">

            <div className="company-search-wrapper">

              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search students, email or opportunities..."
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="clear-search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="company-filter-buttons">

              {[
                ["all", "All"],
                ["applied", "Applied"],
                ["reviewing", "Reviewing"],
                ["shortlisted", "Shortlisted"],
                ["selected", "Selected"],
                ["rejected", "Rejected"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    statusFilter === value
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(value)
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* =================================================
              APPLICATION PANEL
          ================================================= */}

          <section className="company-candidate-panel">

            <div className="company-candidate-heading">

              <div>
                <span>
                  APPLICANT REVIEW
                </span>

                <h2>
                  Student applications
                </h2>

                <p>
                  Candidates are ranked by AI skill
                  alignment and current hiring status.
                </p>
              </div>

              <div className="company-result-badge">
                {filteredApplications.length}
                <span>results</span>
              </div>
            </div>

            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredApplications.length === 0 ? (
              <div className="company-applications-empty">

                <div className="empty-icon">
                  👥
                </div>

                <h3>
                  No applications found
                </h3>

                <p>
                  {applications.length === 0
                    ? "Student applications will appear here when candidates apply to your opportunities."
                    : "Try changing your search or status filter."}
                </p>
              </div>
            ) : (

              /* =================================================
                 CANDIDATE LIST
              ================================================= */

              <div className="company-candidate-list">

                {filteredApplications.map(
                  (application) => {

                    const match = Math.max(
                      0,
                      Math.min(
                        Number(
                          application.matchScore || 0
                        ),
                        100
                      )
                    );

                    const studentName =
                      application.studentName ||
                      "Student";

                    const status =
                      application.status ||
                      "applied";

                    return (
                      <article
                        className="company-candidate-card"
                        key={application.id}
                      >

                        {/* CANDIDATE */}

                        <div className="candidate-main">

                          <div className="candidate-avatar">
                            {studentName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="candidate-details">

                            <h3>
                              {studentName}
                            </h3>

                            <p>
                              {application.internshipTitle ||
                                "Opportunity"}
                            </p>

                            {application.email && (
                              <small>
                                {application.email}
                              </small>
                            )}
                          </div>
                        </div>

                        {/* AI MATCH */}

                        <div className="candidate-match">

                          <div className="candidate-label-row">
                            <span>
                              AI MATCH
                            </span>

                            <strong>
                              {match}%
                            </strong>
                          </div>

                          <div className="candidate-match-track">
                            <i
                              style={{
                                width: `${match}%`,
                              }}
                            />
                          </div>

                          <small>
                            Skill alignment
                          </small>
                        </div>

                        {/* SKILLS */}

                        <div className="candidate-skills">

                          <span>
                            TOP SKILLS
                          </span>

                          <div>
                            {Array.isArray(
                              application.skills
                            ) &&
                            application.skills.length >
                              0 ? (
                              application.skills
                                .slice(0, 4)
                                .map(
                                  (
                                    skill,
                                    index
                                  ) => (
                                    <b
                                      key={
                                        skill?.name ||
                                        index
                                      }
                                    >
                                      {typeof skill ===
                                      "object"
                                        ? skill.name
                                        : skill}
                                    </b>
                                  )
                                )
                            ) : (
                              <b>
                                No skills listed
                              </b>
                            )}
                          </div>
                        </div>

                        {/* STATUS */}

                        <div className="candidate-status">

                          <span>
                            CURRENT STATUS
                          </span>

                          <strong
                            className={getStatusClass(
                              status
                            )}
                          >
                            {getStatusLabel(status)}
                          </strong>
                        </div>

                        {/* ACTION */}

                        <div className="candidate-action">

                          <span>
                            UPDATE
                          </span>

                          <select
                            value={status}
                            disabled={
                              updatingId ===
                              application.id
                            }
                            onChange={(e) =>
                              updateStatus(
                                application.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="applied">
                              Applied
                            </option>

                            <option value="reviewing">
                              Reviewing
                            </option>

                            <option value="shortlisted">
                              Shortlisted
                            </option>

                            <option value="selected">
                              Selected
                            </option>

                            <option value="rejected">
                              Rejected
                            </option>
                          </select>

                          {updatingId ===
                            application.id && (
                            <small>
                              Saving...
                            </small>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* =================================================
              AI FOOTER
          ================================================= */}

          <section className="company-applications-ai">

            <div className="ai-footer-icon">
              ✦
            </div>

            <div className="ai-footer-text">

              <span>
                AISIP AI MATCH ENGINE
              </span>

              <h3>
                Compare skills before you hire.
              </h3>

              <p>
                Skill alignment is one signal to help
                you review candidates and make better
                hiring decisions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/company-dashboard")
              }
            >
              Back to Dashboard →
            </button>
          </section>

        </main>
      </div>
    </div>
  );
}

export default CompanyApplications;