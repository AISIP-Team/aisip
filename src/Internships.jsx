import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function Internships() {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [appliedIds, setAppliedIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getUser = () => {
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

  // =========================================================
  // GET USER ID
  // =========================================================

  const getUserId = () => {
    const user = getUser();

    if (!user?.id) {
      return null;
    }

    return Number(user.id);
  };

  // =========================================================
  // HEADERS
  // =========================================================

  const getHeaders = () => {
    const userId = getUserId();

    return {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    };
  };

  // =========================================================
  // LOAD OPPORTUNITIES
  // =========================================================

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const user = getUser();
      const userId = getUserId();

      if (!userId) {
        throw new Error("Please login as a student first.");
      }

      if (user?.role && user.role !== "student") {
        throw new Error(
          "Please login with a student account to view opportunities."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/internships",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load opportunities. Server status: ${response.status}`
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "The backend returned an invalid opportunities list."
        );
      }

      // -------------------------------------------------------
      // NORMALIZE BACKEND DATA
      // -------------------------------------------------------

      const formattedData = data.map((item) => ({
        ...item,

        id: Number(item.id),

        title: item.title || "Untitled Opportunity",

        company: item.company || "Company",

        location: item.location || "Remote",

        match: Number(
          item.match ??
            item.matchScore ??
            item.match_score ??
            0
        ),

        workType:
          item.workType ||
          item.work_type ||
          "remote",

        opportunityType:
          item.opportunityType ||
          item.opportunity_type ||
          "internship",

        status: item.status || "open",

        skills: Array.isArray(item.skills)
          ? item.skills
          : [],
      }));

      setOpportunities(formattedData);
    } catch (error) {
      console.error(
        "Could not load opportunities:",
        error
      );

      setError(
        error.message ||
          "Unable to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadApplications = async () => {
    try {
      const userId = getUserId();

      if (!userId) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        return;
      }

      if (!response.ok) {
        console.error(
          "Applications API error:",
          data.message
        );
        return;
      }

      if (Array.isArray(data)) {
        const ids = data
          .map((application) =>
            Number(application.internshipId)
          )
          .filter(
            (id) => !Number.isNaN(id)
          );

        setAppliedIds(ids);
      }
    } catch (error) {
      console.error(
        "Could not load applications:",
        error
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadInternships(),
        loadApplications(),
      ]);
    };

    loadData();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredOpportunities = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return opportunities.filter(
      (opportunity) => {
        const title = String(
          opportunity.title || ""
        ).toLowerCase();

        const company = String(
          opportunity.company || ""
        ).toLowerCase();

        const opportunityLocation =
          String(
            opportunity.location || ""
          ).toLowerCase();

        const skills = Array.isArray(
          opportunity.skills
        )
          ? opportunity.skills
          : [];

        const matchesSearch =
          !searchText ||
          title.includes(searchText) ||
          company.includes(searchText) ||
          skills.some((skill) => {
            const name =
              typeof skill === "object"
                ? skill?.name
                : skill;

            return String(name || "")
              .toLowerCase()
              .includes(searchText);
          });

        const normalizedLocation =
          opportunityLocation.trim();

        let matchesLocation = true;

        if (location !== "all") {
          if (location === "remote") {
            matchesLocation =
              normalizedLocation === "remote";
          } else if (
            location === "hybrid"
          ) {
            matchesLocation =
              normalizedLocation === "hybrid";
          } else if (
            location === "kolkata"
          ) {
            matchesLocation =
              normalizedLocation.includes(
                "kolkata"
              );
          }
        }

        return (
          matchesSearch &&
          matchesLocation
        );
      }
    );
  }, [
    opportunities,
    search,
    location,
  ]);

  // =========================================================
  // TOP MATCH
  // =========================================================

  const topMatch = useMemo(() => {
    if (
      filteredOpportunities.length === 0
    ) {
      return null;
    }

    return [...filteredOpportunities].sort(
      (a, b) =>
        Number(b.match || 0) -
        Number(a.match || 0)
    )[0];
  }, [filteredOpportunities]);

  // =========================================================
  // APPLY
  // =========================================================

  const handleApply = async (
    opportunity
  ) => {
    try {
      setError("");
      setSuccess("");

      const userId = getUserId();

      if (!userId) {
        setError(
          "Please login as a student first."
        );
        return;
      }

      const opportunityId =
        Number(opportunity.id);

      if (!opportunityId) {
        setError(
          "Invalid opportunity ID."
        );
        return;
      }

      if (
        appliedIds.includes(
          opportunityId
        )
      ) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            internshipId:
              opportunityId,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from the backend."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit application."
        );
      }

      setAppliedIds(
        (currentIds) => {
          if (
            currentIds.includes(
              opportunityId
            )
          ) {
            return currentIds;
          }

          return [
            ...currentIds,
            opportunityId,
          ];
        }
      );

      setSuccess(
        `Application submitted for "${opportunity.title}".`
      );
    } catch (error) {
      console.error(
        "Could not submit application:",
        error
      );

      setError(
        error.message ||
          "Could not submit application."
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page premium-opportunities-page">
        <Sidebar />

        <div className="profile-main">
          <main className="profile-content">
            <section className="opportunities-loading-card">
              <div className="opportunities-loading-orb">
                ✦
              </div>

              <div>
                <h3>
                  Finding your best opportunities...
                </h3>

                <p>
                  AISIP is analyzing your skills
                  and matching you with relevant
                  roles.
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
    <div className="profile-page premium-opportunities-page">
      <Sidebar />

      <div className="profile-main">
        <main className="profile-content">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="opportunities-hero">

            <div className="opportunities-hero-content">

              <span className="opportunities-kicker">
                AISIP OPPORTUNITY ENGINE
              </span>

              <h1>
                Find opportunities
                <br />
                that{" "}
                <span>
                  fit your skills.
                </span>
              </h1>

              <p>
                Explore internships and jobs ranked
                by how closely they match your current
                skills and profile.
              </p>

              <div className="opportunity-hero-stats">

                <div>
                  <strong>
                    {opportunities.length}
                  </strong>

                  <span>
                    Open roles
                  </span>
                </div>

                <div>
                  <strong>
                    {appliedIds.length}
                  </strong>

                  <span>
                    Applied
                  </span>
                </div>

                <div>
                  <strong>
                    {topMatch
                      ? `${topMatch.match}%`
                      : "—"}
                  </strong>

                  <span>
                    Best match
                  </span>
                </div>

              </div>
            </div>

            <div className="opportunities-hero-visual">

              <div className="opportunity-orbit orbit-one"></div>

              <div className="opportunity-orbit orbit-two"></div>

              <div className="opportunity-core">
                <span>AI</span>
                <strong>MATCH</strong>
              </div>

            </div>

          </section>

          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div className="opportunities-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="opportunities-success">
              <span>✓</span>
              <p>{success}</p>
            </div>
          )}

          {/* =================================================
              SEARCH
          ================================================= */}

          <section className="opportunity-search-card">

            <div className="search-card-heading">

              <div>
                <span>
                  DISCOVER
                </span>

                <h3>
                  Search opportunities
                </h3>

                <p>
                  Search by role, company or skill.
                </p>
              </div>

              <div className="search-result-count">

                {filteredOpportunities.length}

                <span>
                  results
                </span>

              </div>

            </div>

            <div className="premium-opportunity-search">

              <div className="opportunity-search-input">

                <span>⌕</span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search Java Developer, React, SQL..."
                />

              </div>

              <div className="opportunity-location-select">

                <span>◉</span>

                <select
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All Locations
                  </option>

                  <option value="remote">
                    Remote
                  </option>

                  <option value="hybrid">
                    Hybrid
                  </option>

                  <option value="kolkata">
                    Kolkata
                  </option>
                </select>

              </div>

            </div>
          </section>

          {/* =================================================
              BEST MATCH
          ================================================= */}

          {topMatch && (
            <section className="featured-opportunity-card">

              <div className="featured-opportunity-label">
                <span>✦</span>
                BEST MATCH FOR YOU
              </div>

              <div className="featured-opportunity-main">

                <div className="featured-company-logo">
                  {String(
                    topMatch.company || "C"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="featured-opportunity-info">

                  <h2>
                    {topMatch.title}
                  </h2>

                  <p>
                    {topMatch.company}
                    <span>•</span>
                    {topMatch.location}
                  </p>

                  <div className="featured-tags">

                    {topMatch.skills
                      .slice(0, 5)
                      .map(
                        (skill, index) => (
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
                </div>

                <div className="featured-match">

                  <span>
                    AI MATCH
                  </span>

                  <strong>
                    {topMatch.match}%
                  </strong>

                  <small>
                    Skill alignment
                  </small>

                </div>
              </div>

              <div className="featured-opportunity-bottom">

                <div className="featured-fit-text">

                  <span>
                    Why this role?
                  </span>

                  <p>
                    This opportunity has the
                    strongest match with your
                    current skill profile.
                  </p>

                </div>

                <button
                  type="button"
                  className="featured-apply-button"
                  onClick={() =>
                    handleApply(
                      topMatch
                    )
                  }
                  disabled={appliedIds.includes(
                    Number(topMatch.id)
                  )}
                >
                  {appliedIds.includes(
                    Number(topMatch.id)
                  )
                    ? "✓ Already Applied"
                    : "Apply to Best Match →"}
                </button>

              </div>
            </section>
          )}

          {/* =================================================
              RESULTS
          ================================================= */}

          <section className="opportunity-results-section">

            <div className="opportunity-results-heading">

              <div>
                <span>
                  MATCHED OPPORTUNITIES
                </span>

                <h3>
                  Explore your matches
                </h3>
              </div>

              <span>
                {filteredOpportunities.length} roles
              </span>

            </div>

            {filteredOpportunities.length ===
            0 ? (
              <div className="opportunities-empty">

                <div>⌕</div>

                <h4>
                  No opportunities found
                </h4>

                <p>
                  Try another search term or
                  select a different location.
                </p>

              </div>
            ) : (
              <div className="premium-opportunities-grid">

                {filteredOpportunities.map(
                  (opportunity) => {

                    const opportunityId =
                      Number(
                        opportunity.id
                      );

                    const isApplied =
                      appliedIds.includes(
                        opportunityId
                      );

                    const match = Math.max(
                      0,
                      Math.min(
                        Number(
                          opportunity.match || 0
                        ),
                        100
                      )
                    );

                    return (
                      <article
                        className="premium-opportunity-result-card"
                        key={
                          opportunityId
                        }
                      >

                        <div className="result-card-top">

                          <div className="result-company-mark">
                            {String(
                              opportunity.company ||
                                "C"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="result-match">

                            <strong>
                              {match}%
                            </strong>

                            <span>
                              match
                            </span>

                          </div>
                        </div>

                        <div className="result-card-title">

                          <span className="result-type">
                            {opportunity.opportunityType}
                          </span>

                          <h3>
                            {opportunity.title}
                          </h3>

                          <p>
                            {opportunity.company}
                            <span>•</span>
                            {opportunity.location}
                          </p>

                        </div>

                        <div className="result-skills">

                          {opportunity.skills
                            .slice(0, 5)
                            .map(
                              (skill, index) => (
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

                        <div className="result-card-divider"></div>

                        <div className="result-card-bottom">

                          <span className="result-fit">

                            {match >= 80
                              ? "Excellent fit"
                              : match >= 60
                                ? "Good fit"
                                : "Potential fit"}

                          </span>

                          <button
                            type="button"
                            className={
                              isApplied
                                ? "result-applied-button"
                                : "result-apply-button"
                            }
                            onClick={() =>
                              handleApply(
                                opportunity
                              )
                            }
                            disabled={
                              isApplied
                            }
                          >
                            {isApplied
                              ? "✓ Applied"
                              : "Apply →"}
                          </button>

                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* =================================================
              AI EXPLANATION
          ================================================= */}

          <section className="opportunity-ai-banner">

            <div className="opportunity-ai-icon">
              ✦
            </div>

            <div className="opportunity-ai-content">

              <span>
                HOW AISIP MATCHES YOU
              </span>

              <h3>
                Your match score is based on real
                skill requirements.
              </h3>

              <p>
                AISIP compares your current
                proficiency with the required levels
                for each role, helping you focus on
                opportunities where you have the
                strongest potential.
              </p>

            </div>

            <div className="ai-match-steps">

              <span>
                <b>01</b>
                Your skills
              </span>

              <span>
                <b>02</b>
                Role requirements
              </span>

              <span>
                <b>03</b>
                Match score
              </span>

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

export default Internships;