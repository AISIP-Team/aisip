import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function CompanyDashboard() {
  // =========================================================
  // LOGGED-IN COMPANY
  // =========================================================

  const getCompanyUser = () => {
    try {
      const savedUser = localStorage.getItem("aisipUser");

      if (!savedUser) {
        return null;
      }

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
  // FORM
  // =========================================================

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("remote");
  const [opportunityType, setOpportunityType] =
    useState("internship");

  const [skills, setSkills] = useState([
    {
      name: "",
      required: 70,
    },
  ]);

  // =========================================================
  // DATA
  // =========================================================

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [applicationsLoading, setApplicationsLoading] =
    useState(false);

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
  // LOAD OPPORTUNITIES
  // =========================================================

  const loadOpportunities = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/company/internships",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load opportunities."
        );
      }

      setOpportunities(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load opportunities error:",
        error
      );

      setError(
        error.message ||
          "Failed to load opportunities."
      );
    }
  };

  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);

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
          data.message ||
            "Failed to load applications."
        );
      }

      setApplications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load applications error:",
        error
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

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
          "Please login with a company account to access the company dashboard."
        );
        setLoading(false);
        return;
      }

      await Promise.all([
        loadOpportunities(),
        loadApplications(),
      ]);

      setLoading(false);
    };

    loadDashboard();
  }, []);

  // =========================================================
  // SKILLS
  // =========================================================

  const addSkill = () => {
    setSkills((current) => [
      ...current,
      {
        name: "",
        required: 70,
      },
    ]);
  };

  const removeSkill = (index) => {
    setSkills((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const updateSkill = (
    index,
    field,
    value
  ) => {
    setSkills((current) =>
      current.map((skill, i) => {
        if (i !== index) {
          return skill;
        }

        return {
          ...skill,
          [field]:
            field === "required"
              ? Number(value)
              : value,
        };
      })
    );
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setWorkType("remote");
    setOpportunityType("internship");

    setSkills([
      {
        name: "",
        required: 70,
      },
    ]);
  };

  // =========================================================
  // POST OPPORTUNITY
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!COMPANY_USER_ID) {
      setError(
        "Please login with a company account first."
      );
      return;
    }

    const cleanSkills = skills
      .map((skill) => ({
        name: skill.name.trim(),
        required: Number(skill.required),
      }))
      .filter(
        (skill) =>
          skill.name &&
          !Number.isNaN(skill.required) &&
          skill.required >= 0 &&
          skill.required <= 100
      );

    if (!title.trim()) {
      setError(
        "Please enter an opportunity title."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Please enter a description."
      );
      return;
    }

    if (!location.trim()) {
      setError(
        "Please enter a location."
      );
      return;
    }

    if (cleanSkills.length === 0) {
      setError(
        "Please add at least one required skill."
      );
      return;
    }

    try {
      setPosting(true);

      const response = await fetch(
        "http://localhost:5000/api/company/internships",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            workType,
            opportunityType,
            skills: cleanSkills,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to publish opportunity."
        );
      }

      setSuccess(
        "Opportunity published successfully."
      );

      resetForm();
      setShowForm(false);

      await loadOpportunities();
    } catch (error) {
      console.error(
        "Publish error:",
        error
      );

      setError(
        error.message ||
          "Failed to publish opportunity."
      );
    } finally {
      setPosting(false);
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalOpportunities =
    opportunities.length;

  const openOpportunities =
    opportunities.filter(
      (item) => item.status === "open"
    ).length;

  const totalApplications =
    applications.length;

  const reviewingApplications =
    applications.filter(
      (item) => item.status === "reviewing"
    ).length;

  const shortlistedApplications =
    applications.filter(
      (item) => item.status === "shortlisted"
    ).length;

  const selectedApplications =
    applications.filter(
      (item) => item.status === "selected"
    ).length;

  const selectionRate =
    totalApplications > 0
      ? Math.round(
          (selectedApplications /
            totalApplications) *
            100
        )
      : 0;

  // =========================================================
  // TOP CANDIDATES
  // =========================================================

  const topCandidates = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          Number(b.matchScore || 0) -
          Number(a.matchScore || 0)
      )
      .slice(0, 4);
  }, [applications]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const openApplications = () => {
    window.location.href =
      "/company-applications";
  };

  // =========================================================
  // STATUS
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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page premium-company-page">
        <Sidebar />

        <div className="profile-main">
          <main className="profile-content">

            <div className="company-loading-screen">

              <div className="company-loading-orb">
                AI
              </div>

              <h3>
                Preparing your hiring command center
              </h3>

              <p>
                Loading roles and candidate data...
              </p>

            </div>

          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="profile-page premium-company-page">

      <Sidebar />

      <div className="profile-main">

        <main className="profile-content">

          {/* HERO */}

          <section className="company-dashboard-hero">

            <div className="company-hero-content">

              <span>
                AISIP INDUSTRY COMMAND CENTER
              </span>

              <h1>
                Build your{" "}
                <span>next team.</span>
              </h1>

              <p>
                Create opportunities, discover
                high-potential students and manage
                your hiring pipeline from one place.
              </p>

              <div className="company-hero-actions">

                <button
                  type="button"
                  className="company-primary-button"
                  onClick={() => {
                    setShowForm(!showForm);
                    setError("");
                    setSuccess("");

                    if (!showForm) {
                      setTimeout(() => {
                        document
                          .getElementById(
                            "company-posting-section"
                          )
                          ?.scrollIntoView({
                            behavior: "smooth",
                          });
                      }, 100);
                    }
                  }}
                >
                  {showForm
                    ? "Close Posting Form"
                    : "＋ Post Opportunity"}
                </button>

                <button
                  type="button"
                  className="company-secondary-button"
                  onClick={openApplications}
                >
                  View Applications →
                </button>

              </div>

            </div>

            <div className="company-hero-visual">

              <div className="company-visual-ring ring-one"></div>
              <div className="company-visual-ring ring-two"></div>

              <div className="company-visual-core">
                <span>AI</span>
                <strong>HIRE</strong>
              </div>

              <div className="company-floating-stat stat-one">
                <span>Open roles</span>
                <strong>
                  {openOpportunities}
                </strong>
              </div>

              <div className="company-floating-stat stat-two">
                <span>Candidates</span>
                <strong>
                  {totalApplications}
                </strong>
              </div>

            </div>

          </section>

          {/* ALERTS */}

          {error && (
            <div className="company-alert company-alert-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="company-alert company-alert-success">
              <span>✓</span>
              <p>{success}</p>
            </div>
          )}

          {/* STATS */}

          <section className="company-stats-grid">

            <div className="company-stat-card">
              <div className="company-stat-icon blue">
                💼
              </div>

              <div>
                <span>
                  OPPORTUNITIES
                </span>

                <strong>
                  {totalOpportunities}
                </strong>

                <small>
                  Total posted
                </small>
              </div>
            </div>

            <div className="company-stat-card">
              <div className="company-stat-icon green">
                ●
              </div>

              <div>
                <span>
                  OPEN ROLES
                </span>

                <strong>
                  {openOpportunities}
                </strong>

                <small>
                  Currently hiring
                </small>
              </div>
            </div>

            <div className="company-stat-card">
              <div className="company-stat-icon violet">
                👥
              </div>

              <div>
                <span>
                  APPLICATIONS
                </span>

                <strong>
                  {totalApplications}
                </strong>

                <small>
                  Student candidates
                </small>
              </div>
            </div>

            <div className="company-stat-card">
              <div className="company-stat-icon cyan">
                ★
              </div>

              <div>
                <span>
                  SHORTLISTED
                </span>

                <strong>
                  {shortlistedApplications}
                </strong>

                <small>
                  Potential candidates
                </small>
              </div>
            </div>

          </section>

          {/* PIPELINE */}

          <section className="company-panel">

            <div className="company-panel-heading">

              <div>
                <span>
                  HIRING PIPELINE
                </span>

                <h3>
                  Candidate activity
                </h3>

                <p>
                  Track applicants as they move
                  through your recruitment process.
                </p>
              </div>

              <div className="company-pipeline-rate">
                <strong>
                  {selectionRate}%
                </strong>

                <span>
                  selection rate
                </span>
              </div>

            </div>

            <div className="company-pipeline">

              <div className="company-pipeline-item">

                <div className="pipeline-count blue">
                  {totalApplications}
                </div>

                <div>
                  <strong>Applied</strong>
                  <span>New candidates</span>
                </div>

              </div>

              <div className="company-pipeline-arrow">
                →
              </div>

              <div className="company-pipeline-item">

                <div className="pipeline-count yellow">
                  {reviewingApplications}
                </div>

                <div>
                  <strong>Reviewing</strong>
                  <span>Under evaluation</span>
                </div>

              </div>

              <div className="company-pipeline-arrow">
                →
              </div>

              <div className="company-pipeline-item">

                <div className="pipeline-count violet">
                  {shortlistedApplications}
                </div>

                <div>
                  <strong>Shortlisted</strong>
                  <span>Strong potential</span>
                </div>

              </div>

              <div className="company-pipeline-arrow">
                →
              </div>

              <div className="company-pipeline-item">

                <div className="pipeline-count green">
                  {selectedApplications}
                </div>

                <div>
                  <strong>Selected</strong>
                  <span>Successful hire</span>
                </div>

              </div>

            </div>

          </section>

          {/* AI MATCHES */}

          <section className="company-panel">

            <div className="company-panel-heading">

              <div>
                <span>
                  AI CANDIDATE MATCHING
                </span>

                <h3>
                  Highest-potential candidates
                </h3>

                <p>
                  Candidates ranked using their
                  skill alignment with your roles.
                </p>
              </div>

              <button
                type="button"
                className="company-text-button"
                onClick={openApplications}
              >
                View all candidates →
              </button>

            </div>

            {applicationsLoading ? (

              <div className="company-inline-loading">
                <div></div>
                Loading candidates...
              </div>

            ) : topCandidates.length === 0 ? (

              <div className="company-empty-state">

                <div>👥</div>

                <h4>
                  No candidates yet
                </h4>

                <p>
                  Student applications will appear
                  here once they apply to your roles.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(true)
                  }
                >
                  Post an Opportunity →
                </button>

              </div>

            ) : (

              <div className="company-candidate-grid">

                {topCandidates.map(
                  (application) => {

                    const match =
                      Number(
                        application.matchScore ||
                        0
                      );

                    const studentName =
                      application.studentName ||
                      "Student";

                    return (
                      <div
                        className="company-candidate-card"
                        key={application.id}
                      >

                        <div className="candidate-card-top">

                          <div className="candidate-avatar">
                            {studentName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="candidate-match">

                            <strong>
                              {match}%
                            </strong>

                            <span>
                              match
                            </span>

                          </div>

                        </div>

                        <h4>
                          {studentName}
                        </h4>

                        <p>
                          {application.internshipTitle ||
                            "Opportunity"}
                        </p>

                        <div className="candidate-tags">

                          {Array.isArray(
                            application.skills
                          ) &&
                            application.skills
                              .slice(0, 4)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={
                                      skill?.name ||
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

                        <div className="candidate-card-bottom">

                          <span
                            className={`company-status-pill ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status ||
                              "applied"}
                          </span>

                          <button
                            type="button"
                            onClick={
                              openApplications
                            }
                          >
                            Review →
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* POSTING FORM */}

          {showForm && (
            <section
              id="company-posting-section"
              className="company-posting-panel"
            >

              <div className="company-posting-header">

                <div>
                  <span>
                    CREATE NEW OPPORTUNITY
                  </span>

                  <h3>
                    Tell students what
                    you're looking for.
                  </h3>

                  <p>
                    Define the role and required
                    skills so AISIP can identify
                    suitable candidates.
                  </p>
                </div>

                <button
                  type="button"
                  className="company-close-button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  ×
                </button>

              </div>

              <form
                className="company-posting-form"
                onSubmit={handleSubmit}
              >

                <div className="company-form-field full">

                  <label htmlFor="company-title">
                    Opportunity Title
                  </label>

                  <input
                    id="company-title"
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Java Developer Intern"
                    required
                  />

                </div>

                <div className="company-form-field full">

                  <label htmlFor="company-description">
                    Description
                  </label>

                  <textarea
                    id="company-description"
                    rows="5"
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Describe the role, responsibilities and what the student will work on..."
                    required
                  />

                </div>

                <div className="company-form-field">

                  <label htmlFor="company-location">
                    Location
                  </label>

                  <input
                    id="company-location"
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="Remote / Kolkata"
                    required
                  />

                </div>

                <div className="company-form-field">

                  <label htmlFor="company-work-type">
                    Work Type
                  </label>

                  <select
                    id="company-work-type"
                    value={workType}
                    onChange={(e) =>
                      setWorkType(e.target.value)
                    }
                  >
                    <option value="remote">
                      Remote
                    </option>

                    <option value="hybrid">
                      Hybrid
                    </option>

                    <option value="onsite">
                      Onsite
                    </option>
                  </select>

                </div>

                <div className="company-form-field">

                  <label htmlFor="company-opportunity-type">
                    Opportunity Type
                  </label>

                  <select
                    id="company-opportunity-type"
                    value={opportunityType}
                    onChange={(e) =>
                      setOpportunityType(
                        e.target.value
                      )
                    }
                  >
                    <option value="internship">
                      Internship
                    </option>

                    <option value="job">
                      Job
                    </option>
                  </select>

                </div>

                {/* SKILLS */}

                <div className="company-required-skills">

                  <div className="company-skills-heading">

                    <div>
                      <span>
                        AI MATCH CRITERIA
                      </span>

                      <h4>
                        Required Skills
                      </h4>

                      <p>
                        Set the minimum proficiency
                        required for each skill.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addSkill}
                    >
                      + Add Skill
                    </button>

                  </div>

                  <div className="company-skill-input-list">

                    {skills.map(
                      (skill, index) => (

                        <div
                          className="company-skill-input-row"
                          key={index}
                        >

                          <div className="company-form-field">

                            <label>
                              Skill
                            </label>

                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) =>
                                updateSkill(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Java"
                              required
                            />

                          </div>

                          <div className="company-form-field">

                            <label>
                              Required %
                            </label>

                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={
                                skill.required
                              }
                              onChange={(e) =>
                                updateSkill(
                                  index,
                                  "required",
                                  e.target.value
                                )
                              }
                              required
                            />

                          </div>

                          <button
                            type="button"
                            className="company-remove-skill"
                            onClick={() =>
                              removeSkill(index)
                            }
                            disabled={
                              skills.length === 1
                            }
                          >
                            ×
                          </button>

                        </div>

                      )
                    )}

                  </div>

                </div>

                <div className="company-form-actions">

                  <button
                    type="button"
                    className="company-cancel-button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="company-publish-button"
                    disabled={posting}
                  >
                    {posting ? (
                      <>
                        <span className="company-button-spinner"></span>
                        Publishing...
                      </>
                    ) : (
                      <>
                        Publish Opportunity
                        <span>→</span>
                      </>
                    )}
                  </button>

                </div>

              </form>

            </section>
          )}

          {/* POSTED ROLES */}

          <section className="company-panel">

            <div className="company-panel-heading">

              <div>
                <span>
                  YOUR OPPORTUNITIES
                </span>

                <h3>
                  Active roles
                </h3>

                <p>
                  Manage the opportunities published
                  by your company.
                </p>
              </div>

              <button
                type="button"
                className="company-text-button"
                onClick={() => {
                  setShowForm(true);

                  setTimeout(() => {
                    document
                      .getElementById(
                        "company-posting-section"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }, 100);
                }}
              >
                + Post role
              </button>

            </div>

            {opportunities.length === 0 ? (

              <div className="company-empty-state">

                <div>💼</div>

                <h4>
                  No opportunities posted
                </h4>

                <p>
                  Publish your first opportunity
                  to start receiving applications.
                </p>

              </div>

            ) : (

              <div className="company-opportunity-list">

                {opportunities.map(
                  (opportunity) => (

                    <div
                      className="company-role-card"
                      key={opportunity.id}
                    >

                      <div className="company-role-logo">
                        {String(
                          opportunity.title ||
                            "R"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="company-role-main">

                        <div className="company-role-title-row">

                          <h4>
                            {opportunity.title}
                          </h4>

                          <span>
                            {opportunity.opportunityType ||
                              "internship"}
                          </span>

                        </div>

                        <p>
                          {opportunity.location ||
                            "Remote"}

                          <b>•</b>

                          {opportunity.workType ||
                            "remote"}
                        </p>

                        <div className="company-role-tags">

                          {Array.isArray(
                            opportunity.skills
                          ) &&
                            opportunity.skills
                              .slice(0, 5)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={
                                      skill?.name ||
                                      index
                                    }
                                  >
                                    {typeof skill ===
                                    "object"
                                      ? `${skill.name} ${skill.required}%`
                                      : skill}
                                  </span>
                                )
                              )}

                        </div>

                      </div>

                      <div className="company-role-status">

                        <span
                          className={
                            opportunity.status ===
                            "open"
                              ? "role-open"
                              : "role-closed"
                          }
                        >
                          <i></i>

                          {opportunity.status ||
                            "open"}
                        </span>

                        <small>
                          Role status
                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* AI FOOTER */}

          <section className="company-ai-banner">

            <div className="company-ai-icon">
              ✦
            </div>

            <div>
              <span>
                AISIP AI HIRING ENGINE
              </span>

              <h3>
                Let skills guide your hiring decisions.
              </h3>

              <p>
                AISIP compares applicant skills with
                opportunity requirements so you can
                identify promising candidates faster.
              </p>
            </div>

            <button
              type="button"
              onClick={openApplications}
            >
              Review Candidates →
            </button>

          </section>

        </main>
      </div>
    </div>
  );
}

export default CompanyDashboard;