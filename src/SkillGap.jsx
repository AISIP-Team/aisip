import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function SkillGap() {
  const [skills, setSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.error("Could not read aisipUser:", error);
      return null;
    }
  };

  // =========================================================
  // GET USER ID
  // =========================================================

  const getUserId = () => {
    const user = getUser();

    if (!user || !user.id) {
      return null;
    }

    return Number(user.id);
  };

  // =========================================================
  // LOAD SKILLS
  // =========================================================

  const loadSkills = async (userId) => {
    const response = await fetch(
      "http://localhost:5000/api/skills",
      {
        method: "GET",
        headers: {
          "X-User-Id": String(userId),
        },
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The backend returned an invalid response while loading skills."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Failed to load skills. Server status: ${response.status}`
      );
    }

    return Array.isArray(data) ? data : [];
  };

  // =========================================================
  // LOAD OPPORTUNITIES
  // =========================================================

  const loadOpportunities = async (userId) => {
    const response = await fetch(
      "http://localhost:5000/api/internships",
      {
        method: "GET",
        headers: {
          "X-User-Id": String(userId),
        },
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The backend returned an invalid response while loading opportunities."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Failed to load opportunities. Server status: ${response.status}`
      );
    }

    return Array.isArray(data) ? data : [];
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserId();

        if (!userId) {
          setError("Please login as a student first.");
          setSkills([]);
          setOpportunities([]);
          return;
        }

        const user = getUser();

        if (user?.role && user.role !== "student") {
          setError(
            "Please login with a student account to view Skill Gap Analysis."
          );
          setSkills([]);
          setOpportunities([]);
          return;
        }

        // Load skills
        try {
          const studentSkills = await loadSkills(userId);
          setSkills(studentSkills);
        } catch (skillError) {
          console.error("Skills API error:", skillError);

          setError(`Skills error: ${skillError.message}`);
          return;
        }

        // Load opportunities
        try {
          const internshipData =
            await loadOpportunities(userId);

          setOpportunities(internshipData);
        } catch (opportunityError) {
          console.error(
            "Opportunities API error:",
            opportunityError
          );

          setError(
            `Opportunities error: ${opportunityError.message}`
          );

          return;
        }
      } catch (error) {
        console.error(
          "Skill gap loading error:",
          error
        );

        setError(
          error.message ||
            "Something went wrong while loading Skill Gap Analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================================================
  // GET STUDENT SKILL LEVEL
  // =========================================================

  const getSkillLevel = (skillName) => {
    const skill = skills.find(
      (item) =>
        String(item.name || "")
          .trim()
          .toLowerCase() ===
        String(skillName || "")
          .trim()
          .toLowerCase()
    );

    return skill ? Number(skill.level) : 0;
  };

  // =========================================================
  // GET MATCH SCORE
  // =========================================================

  const getMatchScore = (opportunity) => {
    return Number(
      opportunity?.matchScore ??
        opportunity?.match ??
        0
    );
  };

  // =========================================================
  // BEST MATCH
  // =========================================================

  const bestOpportunity = useMemo(() => {
    if (opportunities.length === 0) {
      return null;
    }

    return [...opportunities].sort(
      (a, b) =>
        getMatchScore(b) -
        getMatchScore(a)
    )[0];
  }, [opportunities]);

  // =========================================================
  // REAL DATABASE REQUIREMENTS
  // =========================================================

  const skillComparisons = useMemo(() => {
    if (
      !bestOpportunity ||
      !Array.isArray(bestOpportunity.skills)
    ) {
      return [];
    }

    return bestOpportunity.skills.map((skill) => {
      const skillName =
        typeof skill === "object"
          ? skill.name
          : skill;

      const requiredLevel =
        typeof skill === "object"
          ? Number(skill.required || 0)
          : 70;

      const currentLevel =
        getSkillLevel(skillName);

      return {
        name: skillName,
        current: currentLevel,
        required: requiredLevel,
        gap: Math.max(
          requiredLevel - currentLevel,
          0
        ),
      };
    });
  }, [bestOpportunity, skills]);

  // =========================================================
  // READINESS
  // =========================================================

  const readiness = useMemo(() => {
    if (skillComparisons.length === 0) {
      return 0;
    }

    const total = skillComparisons.reduce(
      (sum, skill) => {
        const percentage =
          skill.required > 0
            ? Math.min(
                (skill.current /
                  skill.required) *
                  100,
                100
              )
            : 100;

        return sum + percentage;
      },
      0
    );

    return Math.round(
      total / skillComparisons.length
    );
  }, [skillComparisons]);

  // =========================================================
  // MISSING SKILLS
  // =========================================================

  const missingSkills = useMemo(() => {
    return skillComparisons
      .filter(
        (skill) =>
          skill.current < skill.required
      )
      .sort(
        (a, b) => b.gap - a.gap
      );
  }, [skillComparisons]);

  const strongestMissingSkills =
    missingSkills.slice(0, 4);

  const roadmap =
    strongestMissingSkills.slice(0, 3);

  // =========================================================
  // READY LABEL
  // =========================================================

  const readinessLabel =
    readiness >= 85
      ? "Highly Ready"
      : readiness >= 70
      ? "Career Ready"
      : readiness >= 50
      ? "Developing"
      : "Needs Improvement";

  // =========================================================
  // READINESS DESCRIPTION
  // =========================================================

  const readinessDescription =
    readiness >= 85
      ? "Your current skills are strongly aligned with the selected industry opportunity."
      : readiness >= 70
      ? "You have a solid foundation and are close to meeting most opportunity requirements."
      : readiness >= 50
      ? "Your profile has a good foundation, but a few targeted skill improvements can make a big difference."
      : "Focus on your highest-priority skill gaps before applying to maximize your opportunity fit.";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page premium-skill-gap-page">
        <Sidebar />

        <div className="profile-main">
          <main className="profile-content">
            <section className="gap-loading-card">
              <div className="gap-loading-orb">
                ✦
              </div>

              <div>
                <h3>
                  AI is analyzing your profile...
                </h3>

                <p>
                  Comparing your skills with current
                  opportunity requirements.
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
    <div className="profile-page premium-skill-gap-page">

      <Sidebar />

      <div className="profile-main">
        <main className="profile-content">

          {/* HEADER */}

          <section className="gap-page-header">
            <div>
              <span className="gap-page-kicker">
                AISIP AI ENGINE
              </span>

              <h1>
                Understand your{" "}
                <span>skill gap.</span>
              </h1>

              <p>
                AISIP compares your current skills
                against real opportunity requirements
                to show exactly where you can improve.
              </p>
            </div>

            <div className="gap-ai-visual">
              <div className="gap-orbit orbit-a"></div>
              <div className="gap-orbit orbit-b"></div>

              <div className="gap-ai-core">
                AI
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div className="gap-error">
              <span>!</span>

              <p>{error}</p>
            </div>
          )}

          {/* TARGET OPPORTUNITY */}

          {bestOpportunity && (
            <section className="gap-target-card">

              <div className="gap-target-info">
                <span>
                  CURRENT BEST MATCH
                </span>

                <h2>
                  {bestOpportunity.title}
                </h2>

                <p>
                  {bestOpportunity.company ||
                    "Company"}

                  <b>•</b>

                  {bestOpportunity.location ||
                    "Remote"}
                </p>
              </div>

              <div className="gap-target-match">
                <small>MATCH</small>

                <strong>
                  {getMatchScore(bestOpportunity)}%
                </strong>

                <span>
                  Based on your skills
                </span>
              </div>

            </section>
          )}

          {/* TOP INSIGHT GRID */}

          <section className="gap-overview-grid">

            {/* READINESS */}

            <div className="gap-readiness-card">

              <div className="gap-card-heading">

                <div>
                  <span>
                    INDUSTRY READINESS
                  </span>

                  <h3>
                    Your current level
                  </h3>
                </div>

                <div className="gap-mini-ai">
                  AI
                </div>

              </div>

              <div className="gap-readiness-content">

                <div
                  className="gap-readiness-circle"
                  style={{
                    "--gap-readiness":
                      readiness,
                  }}
                >
                  <div>
                    <strong>
                      {readiness}%
                    </strong>

                    <span>
                      {readinessLabel}
                    </span>
                  </div>
                </div>

                <div className="gap-readiness-copy">

                  <strong>
                    {readiness >= 70
                      ? "You're on the right track."
                      : "There's room to grow."}
                  </strong>

                  <p>
                    {readinessDescription}
                  </p>

                </div>
              </div>

              <div className="gap-readiness-bar">
                <div
                  style={{
                    width: `${readiness}%`,
                  }}
                ></div>
              </div>

            </div>

            {/* TOP PRIORITIES */}

            <div className="gap-priority-card">

              <div className="gap-card-heading">

                <div>
                  <span>
                    TOP PRIORITIES
                  </span>

                  <h3>
                    Skills to improve
                  </h3>
                </div>

                <div className="gap-priority-count">
                  {strongestMissingSkills.length}
                </div>

              </div>

              {strongestMissingSkills.length ===
              0 ? (

                <div className="gap-all-good">

                  <div>✓</div>

                  <strong>
                    You're meeting all tracked
                    requirements.
                  </strong>

                  <p>
                    Keep developing your existing
                    skills to stay competitive.
                  </p>

                </div>

              ) : (

                <div className="gap-priority-list">

                  {strongestMissingSkills
                    .map((skill, index) => (

                      <div
                        className="gap-priority-row"
                        key={skill.name}
                      >

                        <span>
                          0{index + 1}
                        </span>

                        <div>
                          <strong>
                            {skill.name}
                          </strong>

                          <small>
                            {skill.current}%
                            current ·{" "}
                            {skill.required}%
                            required
                          </small>
                        </div>

                        <b>
                          -{skill.gap}%
                        </b>

                      </div>

                    ))}

                </div>

              )}

            </div>

          </section>

          {/* SKILL COMPARISON */}

          <section className="gap-section-card">

            <div className="gap-section-header">

              <div>
                <span>
                  SKILL COMPARISON
                </span>

                <h3>
                  Where you stand
                </h3>

                <p>
                  Compare your current proficiency
                  with what your best-matched
                  opportunity expects.
                </p>
              </div>

              <div className="comparison-legend">

                <span>
                  <i className="legend-current"></i>
                  Your level
                </span>

                <span>
                  <i className="legend-required"></i>
                  Required
                </span>

              </div>

            </div>

            {skillComparisons.length ===
            0 ? (

              <div className="gap-empty">

                <div>✦</div>

                <h4>
                  No skill requirements available
                </h4>

                <p>
                  There are no requirement records
                  available for the selected
                  opportunity.
                </p>

              </div>

            ) : (

              <div className="comparison-list">

                {skillComparisons.map(
                  (skill) => {

                    const currentWidth =
                      Math.min(
                        skill.current,
                        100
                      );

                    const requiredWidth =
                      Math.min(
                        skill.required,
                        100
                      );

                    const percentage =
                      skill.required > 0
                        ? Math.min(
                            Math.round(
                              (skill.current /
                                skill.required) *
                                100
                            ),
                            100
                          )
                        : 100;

                    return (
                      <div
                        className="comparison-item"
                        key={skill.name}
                      >

                        <div className="comparison-top">

                          <div>
                            <strong>
                              {skill.name}
                            </strong>

                            {skill.gap > 0 ? (
                              <span>
                                {skill.gap}% gap
                              </span>
                            ) : (
                              <span className="comparison-good">
                                Requirement met
                              </span>
                            )}
                          </div>

                          <b>
                            {skill.current}%
                            <em>
                              /{skill.required}%
                            </em>
                          </b>

                        </div>

                        <div className="comparison-track">

                          <div
                            className="comparison-required"
                            style={{
                              width:
                                `${requiredWidth}%`,
                            }}
                          ></div>

                          <div
                            className="comparison-current"
                            style={{
                              width:
                                `${currentWidth}%`,
                            }}
                          ></div>

                        </div>

                        <div className="comparison-bottom">

                          <span>
                            Current:{" "}
                            {skill.current}%
                          </span>

                          <span>
                            Required:{" "}
                            {skill.required}%
                          </span>

                          <span>
                            Alignment:{" "}
                            {percentage}%
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* LEARNING ROADMAP */}

          <section className="gap-section-card">

            <div className="gap-section-header">

              <div>
                <span>
                  PERSONALIZED ROADMAP
                </span>

                <h3>
                  Your next learning moves
                </h3>

                <p>
                  AISIP prioritizes the areas with
                  the largest skill gaps.
                </p>
              </div>

            </div>

            {roadmap.length === 0 ? (

              <div className="gap-all-good roadmap-success">

                <div>✓</div>

                <strong>
                  Your current roadmap is clear.
                </strong>

                <p>
                  Focus on maintaining and deepening
                  your existing skills.
                </p>

              </div>

            ) : (

              <div className="gap-roadmap">

                {roadmap.map(
                  (skill, index) => (

                    <div
                      className="gap-roadmap-item"
                      key={skill.name}
                    >

                      <div className="roadmap-number">
                        {index + 1}
                      </div>

                      <div className="roadmap-line"></div>

                      <div className="roadmap-content">

                        <span>
                          PRIORITY {index + 1}
                        </span>

                        <h4>
                          Strengthen{" "}
                          {skill.name}
                        </h4>

                        <p>
                          Move from{" "}
                          <strong>
                            {skill.current}%
                          </strong>{" "}
                          toward the{" "}
                          <strong>
                            {skill.required}%
                          </strong>{" "}
                          opportunity requirement.
                        </p>

                      </div>

                      <div className="roadmap-gap">

                        {skill.gap}%

                        <small>
                          gap
                        </small>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* AI INSIGHT */}

          <section className="gap-ai-insight">

            <div className="gap-ai-insight-icon">
              ✦
            </div>

            <div className="gap-ai-insight-content">

              <span>
                AISIP AI INSIGHT
              </span>

              <h3>
                {strongestMissingSkills.length >
                0
                  ? `Your highest-impact improvement is ${strongestMissingSkills[0].name}.`
                  : "Your profile is currently well aligned."}
              </h3>

              <p>
                {strongestMissingSkills.length >
                0
                  ? `You're currently at ${strongestMissingSkills[0].current}% in ${strongestMissingSkills[0].name}, while the selected opportunity expects ${strongestMissingSkills[0].required}%. Improving this area can strengthen your overall match.`
                  : "Your skills meet all tracked requirements for the selected opportunity. Continue developing your portfolio to unlock stronger matches."}
              </p>

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

export default SkillGap;