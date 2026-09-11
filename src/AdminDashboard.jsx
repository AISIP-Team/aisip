import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function AdminDashboard() {
  // =========================================================
  // LOGGED-IN ADMIN
  // =========================================================

  const getAdminUser = () => {
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

  const adminUser = getAdminUser();

  const ADMIN_USER_ID = adminUser?.id
    ? Number(adminUser.id)
    : null;

  // =========================================================
  // STATE
  // =========================================================

  const [users, setUsers] = useState([]);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] =
    useState("overview");

  // =========================================================
  // HEADERS
  // =========================================================

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "X-User-Id": String(ADMIN_USER_ID),
  });

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    const response = await fetch(
      "http://localhost:5000/api/admin/users",
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load users."
      );
    }

    setUsers(Array.isArray(data) ? data : []);
  };

  // =========================================================
  // LOAD INTERNSHIPS
  // =========================================================

  const loadInternships = async () => {
    const response = await fetch(
      "http://localhost:5000/api/admin/internships",
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

    setInternships(
      Array.isArray(data) ? data : []
    );
  };

  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadApplications = async () => {
    const response = await fetch(
      "http://localhost:5000/api/admin/applications",
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
  };

  // =========================================================
  // LOAD EVERYTHING
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      if (!ADMIN_USER_ID) {
        throw new Error(
          "Please login with an admin account first."
        );
      }

      if (
        adminUser?.role &&
        adminUser.role !== "admin"
      ) {
        throw new Error(
          "Please login with an admin account to access the control center."
        );
      }

      await Promise.all([
        loadUsers(),
        loadInternships(),
        loadApplications(),
      ]);
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setError(
        error.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === "student"
  ).length;

  const totalCompanies = users.filter(
    (user) => user.role === "company"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const totalInternships =
    internships.length;

  const openInternships =
    internships.filter(
      (item) => item.status === "open"
    ).length;

  const totalApplications =
    applications.length;

  const appliedApplications =
    applications.filter(
      (item) => item.status === "applied"
    ).length;

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

  const rejectedApplications =
    applications.filter(
      (item) => item.status === "rejected"
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
  // RECENT DATA
  // =========================================================

  const recentUsers = useMemo(() => {
    return [...users].slice(0, 6);
  }, [users]);

  const recentApplications = useMemo(() => {
    return [...applications].slice(0, 6);
  }, [applications]);

  const recentInternships = useMemo(() => {
    return [...internships].slice(0, 6);
  }, [internships]);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const name = String(
        user.name || ""
      ).toLowerCase();

      const email = String(
        user.email || ""
      ).toLowerCase();

      const role = String(
        user.role || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });
  }, [users, search]);

  // =========================================================
  // FILTER OPPORTUNITIES
  // =========================================================

  const filteredInternships = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return internships;
    }

    return internships.filter(
      (internship) => {
        const title = String(
          internship.title || ""
        ).toLowerCase();

        const company = String(
          internship.company || ""
        ).toLowerCase();

        const location = String(
          internship.location || ""
        ).toLowerCase();

        return (
          title.includes(query) ||
          company.includes(query) ||
          location.includes(query)
        );
      }
    );
  }, [internships, search]);

  // =========================================================
  // FILTER APPLICATIONS
  // =========================================================

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter(
      (application) => {
        const student = String(
          application.studentName || ""
        ).toLowerCase();

        const opportunity = String(
          application.internshipTitle || ""
        ).toLowerCase();

        const status = String(
          application.status || ""
        ).toLowerCase();

        return (
          student.includes(query) ||
          opportunity.includes(query) ||
          status.includes(query)
        );
      }
    );
  }, [applications, search]);

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "selected":
        return "admin-status-selected";

      case "shortlisted":
        return "admin-status-shortlisted";

      case "reviewing":
        return "admin-status-reviewing";

      case "rejected":
        return "admin-status-rejected";

      default:
        return "admin-status-applied";
    }
  };

  // =========================================================
  // ROLE CLASS
  // =========================================================

  const getRoleClass = (role) => {
    switch (role) {
      case "student":
        return "admin-role-student";

      case "company":
        return "admin-role-company";

      case "admin":
        return "admin-role-admin";

      default:
        return "admin-role-other";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page premium-admin-page">

        <Sidebar />

        <div className="profile-main">

          <main className="profile-content">

            <div className="admin-loading-screen">

              <div className="admin-loading-orb">
                A
              </div>

              <h3>
                Loading AISIP control center
              </h3>

              <p>
                Gathering platform data...
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
    <div className="profile-page premium-admin-page">

      <Sidebar />

      <div className="profile-main">

        <main className="profile-content">

          {/* HERO */}

          <section className="admin-dashboard-hero">

            <div>

              <span>
                AISIP PLATFORM CONTROL CENTER
              </span>

              <h1>
                Manage the{" "}
                <em>entire ecosystem.</em>
              </h1>

              <p>
                Monitor students, companies,
                opportunities and applications
                from one central administration view.
              </p>

            </div>

            <div className="admin-hero-orb">

              <div>
                <strong>
                  AISIP
                </strong>

                <span>
                  CONTROL
                </span>
              </div>

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="company-alert company-alert-error">

              <span>!</span>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* MAIN STATS */}

          <section className="admin-stats-grid">

            <div className="admin-stat-card">

              <div className="admin-stat-icon blue">
                👥
              </div>

              <span>
                USERS
              </span>

              <strong>
                {totalUsers}
              </strong>

              <small>
                Registered accounts
              </small>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon green">
                🎓
              </div>

              <span>
                STUDENTS
              </span>

              <strong>
                {totalStudents}
              </strong>

              <small>
                Student accounts
              </small>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon violet">
                🏢
              </div>

              <span>
                COMPANIES
              </span>

              <strong>
                {totalCompanies}
              </strong>

              <small>
                Industry accounts
              </small>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon cyan">
                💼
              </div>

              <span>
                OPPORTUNITIES
              </span>

              <strong>
                {totalInternships}
              </strong>

              <small>
                Total opportunities
              </small>

            </div>

          </section>

          {/* SECONDARY STATS */}

          <section className="admin-mini-stats">

            <div>
              <span>
                OPEN ROLES
              </span>

              <strong>
                {openInternships}
              </strong>
            </div>

            <div>
              <span>
                APPLICATIONS
              </span>

              <strong>
                {totalApplications}
              </strong>
            </div>

            <div>
              <span>
                NEW
              </span>

              <strong>
                {appliedApplications}
              </strong>
            </div>

            <div>
              <span>
                REVIEWING
              </span>

              <strong>
                {reviewingApplications}
              </strong>
            </div>

            <div>
              <span>
                SHORTLISTED
              </span>

              <strong>
                {shortlistedApplications}
              </strong>
            </div>

            <div>
              <span>
                SELECTION RATE
              </span>

              <strong>
                {selectionRate}%
              </strong>
            </div>

          </section>

          {/* TABS */}

          <section className="admin-control-tabs">

            <button
              type="button"
              className={
                activeSection === "overview"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection("overview");
                setSearch("");
              }}
            >
              Overview
            </button>

            <button
              type="button"
              className={
                activeSection === "users"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection("users");
                setSearch("");
              }}
            >
              Users
            </button>

            <button
              type="button"
              className={
                activeSection === "opportunities"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection("opportunities");
                setSearch("");
              }}
            >
              Opportunities
            </button>

            <button
              type="button"
              className={
                activeSection === "applications"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection("applications");
                setSearch("");
              }}
            >
              Applications
            </button>

          </section>

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeSection === "overview" && (
            <>

              <section className="admin-two-column">

                {/* PLATFORM HEALTH */}

                <div className="admin-panel">

                  <div className="admin-panel-heading">

                    <div>

                      <span>
                        PLATFORM HEALTH
                      </span>

                      <h3>
                        AISIP ecosystem
                      </h3>

                    </div>

                    <div className="admin-health-dot">
                      ● Online
                    </div>

                  </div>

                  <div className="admin-health-list">

                    <div>
                      <span>
                        Student accounts
                      </span>

                      <strong>
                        {totalStudents}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Company accounts
                      </span>

                      <strong>
                        {totalCompanies}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Admin accounts
                      </span>

                      <strong>
                        {totalAdmins}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Open opportunities
                      </span>

                      <strong>
                        {openInternships}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* APPLICATION PIPELINE */}

                <div className="admin-panel">

                  <div className="admin-panel-heading">

                    <div>

                      <span>
                        APPLICATION PIPELINE
                      </span>

                      <h3>
                        Recruitment activity
                      </h3>

                    </div>

                  </div>

                  <div className="admin-health-list">

                    <div>
                      <span>
                        Applied
                      </span>

                      <strong>
                        {appliedApplications}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Reviewing
                      </span>

                      <strong>
                        {reviewingApplications}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Shortlisted
                      </span>

                      <strong>
                        {shortlistedApplications}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Selected
                      </span>

                      <strong>
                        {selectedApplications}
                      </strong>
                    </div>

                  </div>

                </div>

              </section>

              {/* RECENT APPLICATIONS */}

              <section className="admin-panel">

                <div className="admin-panel-heading">

                  <div>

                    <span>
                      RECENT ACTIVITY
                    </span>

                    <h3>
                      Latest applications
                    </h3>

                    <p>
                      Recent student applications
                      across the platform.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="company-text-button"
                    onClick={() =>
                      setActiveSection(
                        "applications"
                      )
                    }
                  >
                    View all →
                  </button>

                </div>

                {recentApplications.length === 0 ? (

                  <div className="admin-empty-state">
                    <div>
                      ◎
                    </div>

                    <h4>
                      No applications yet
                    </h4>

                    <p>
                      Application activity will
                      appear here.
                    </p>
                  </div>

                ) : (

                  <div className="admin-activity-list">

                    {recentApplications.map(
                      (application) => (

                        <div
                          className="admin-activity-row"
                          key={application.id}
                        >

                          <div className="admin-activity-avatar">
                            {String(
                              application.studentName ||
                                "S"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="admin-activity-main">

                            <strong>
                              {application.studentName ||
                                "Student"}
                            </strong>

                            <span>
                              {application.internshipTitle ||
                                "Opportunity"}
                            </span>

                          </div>

                          <div className="admin-activity-match">
                            {Number(
                              application.matchScore ||
                                0
                            )}
                            %
                          </div>

                          <span
                            className={`admin-status-pill ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status ||
                              "applied"}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

              {/* RECENT OPPORTUNITIES */}

              <section className="admin-panel">

                <div className="admin-panel-heading">

                  <div>

                    <span>
                      OPPORTUNITY ACTIVITY
                    </span>

                    <h3>
                      Latest posted roles
                    </h3>

                  </div>

                  <button
                    type="button"
                    className="company-text-button"
                    onClick={() =>
                      setActiveSection(
                        "opportunities"
                      )
                    }
                  >
                    View all →
                  </button>

                </div>

                {recentInternships.length === 0 ? (

                  <div className="admin-empty-state">
                    <div>
                      💼
                    </div>

                    <h4>
                      No opportunities yet
                    </h4>

                    <p>
                      Posted roles will appear
                      here.
                    </p>
                  </div>

                ) : (

                  <div className="admin-opportunity-list">

                    {recentInternships.map(
                      (internship) => (

                        <div
                          className="admin-opportunity-row"
                          key={internship.id}
                        >

                          <div className="admin-opportunity-icon">
                            {String(
                              internship.title ||
                                "R"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {internship.title ||
                                "Opportunity"}
                            </strong>

                            <span>
                              {internship.company ||
                                "Company"}
                              {" • "}
                              {internship.location ||
                                "Location"}
                            </span>
                          </div>

                          <span
                            className={
                              internship.status ===
                              "open"
                                ? "role-open"
                                : "role-closed"
                            }
                          >
                            ●{" "}
                            {internship.status ||
                              "open"}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            </>
          )}

          {/* =================================================
              USERS
          ================================================= */}

          {activeSection === "users" && (
            <section className="admin-panel">

              <div className="admin-panel-heading">

                <div>

                  <span>
                    USER MANAGEMENT
                  </span>

                  <h3>
                    Registered users
                  </h3>

                  <p>
                    Search students, companies
                    and administrators.
                  </p>

                </div>

                <span className="company-result-count">
                  {filteredUsers.length} results
                </span>

              </div>

              <div className="admin-search-box">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by name, email or role..."
                />

              </div>

              {filteredUsers.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    👤
                  </div>

                  <h4>
                    No users found
                  </h4>

                  <p>
                    Try a different search term.
                  </p>

                </div>

              ) : (

                <div className="admin-user-list">

                  {filteredUsers.map(
                    (user) => (

                      <div
                        className="admin-user-row"
                        key={user.id}
                      >

                        <div className="admin-user-avatar">
                          {String(
                            user.name || "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="admin-user-main">

                          <strong>
                            {user.name ||
                              "Unnamed User"}
                          </strong>

                          <span>
                            {user.email ||
                              "No email"}
                          </span>

                        </div>

                        <span
                          className={`admin-role-pill ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {user.role ||
                            "unknown"}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>
          )}

          {/* =================================================
              OPPORTUNITIES
          ================================================= */}

          {activeSection === "opportunities" && (
            <section className="admin-panel">

              <div className="admin-panel-heading">

                <div>

                  <span>
                    OPPORTUNITY MANAGEMENT
                  </span>

                  <h3>
                    Platform opportunities
                  </h3>

                  <p>
                    Monitor every internship
                    and job published on AISIP.
                  </p>

                </div>

                <span className="company-result-count">
                  {filteredInternships.length} results
                </span>

              </div>

              <div className="admin-search-box">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search title, company or location..."
                />

              </div>

              {filteredInternships.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    💼
                  </div>

                  <h4>
                    No opportunities found
                  </h4>

                  <p>
                    Try a different search term.
                  </p>

                </div>

              ) : (

                <div className="admin-opportunity-list">

                  {filteredInternships.map(
                    (internship) => (

                      <div
                        className="admin-opportunity-row"
                        key={internship.id}
                      >

                        <div className="admin-opportunity-icon">

                          {String(
                            internship.title ||
                              "R"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <strong>
                            {internship.title ||
                              "Opportunity"}
                          </strong>

                          <span>
                            {internship.company ||
                              "Company"}
                            {" • "}
                            {internship.location ||
                              "Location"}
                          </span>

                        </div>

                        <div className="admin-opportunity-meta">

                          <span>
                            {internship.opportunityType ||
                              "internship"}
                          </span>

                          <span>
                            {internship.workType ||
                              "remote"}
                          </span>

                        </div>

                        <span
                          className={
                            internship.status ===
                            "open"
                              ? "role-open"
                              : "role-closed"
                          }
                        >
                          ●{" "}
                          {internship.status ||
                            "open"}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>
          )}

          {/* =================================================
              APPLICATIONS
          ================================================= */}

          {activeSection === "applications" && (
            <section className="admin-panel">

              <div className="admin-panel-heading">

                <div>

                  <span>
                    APPLICATION MANAGEMENT
                  </span>

                  <h3>
                    Platform applications
                  </h3>

                  <p>
                    Monitor recruitment activity
                    across all opportunities.
                  </p>

                </div>

                <span className="company-result-count">
                  {filteredApplications.length} results
                </span>

              </div>

              <div className="admin-search-box">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search student, opportunity or status..."
                />

              </div>

              {filteredApplications.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    📄
                  </div>

                  <h4>
                    No applications found
                  </h4>

                  <p>
                    Try a different search term.
                  </p>

                </div>

              ) : (

                <div className="admin-application-list">

                  {filteredApplications.map(
                    (application) => (

                      <div
                        className="admin-application-row"
                        key={application.id}
                      >

                        <div className="admin-user-avatar">

                          {String(
                            application.studentName ||
                              "S"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div className="admin-application-main">

                          <strong>
                            {application.studentName ||
                              "Student"}
                          </strong>

                          <span>
                            {application.internshipTitle ||
                              "Opportunity"}
                          </span>

                        </div>

                        <div className="admin-application-match">

                          <span>
                            AI MATCH
                          </span>

                          <strong>
                            {Number(
                              application.matchScore ||
                                0
                            )}
                            %
                          </strong>

                        </div>

                        <span
                          className={`admin-status-pill ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {application.status ||
                            "applied"}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>
          )}

          {/* AI FOOTER */}

          <section className="admin-ai-banner">

            <div className="admin-ai-icon">
              ✦
            </div>

            <div>

              <span>
                AISIP PLATFORM INTELLIGENCE
              </span>

              <h3>
                One platform. One connected
                ecosystem.
              </h3>

              <p>
                AISIP brings student skills,
                industry opportunities and
                recruitment activity into one
                centralized view.
              </p>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;