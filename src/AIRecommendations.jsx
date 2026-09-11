import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function AIRecommendations() {
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
      console.error("Could not read logged-in user:", error);
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
        "Invalid response received while loading skills."
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
        "Invalid response received while loading opportunities."
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
  // LOAD ALL DATA
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserId();

        if (!userId) {
          setError("Please login as a student first.");
          return;
        }

        const user = getUser();

        if (user?.role && user.role !== "student") {
          setError(
            "Please login with a student account to view AI Recommendations."
          );
          return;
        }

        // Load student skills
        const studentSkills = await loadSkills(userId);
        setSkills(studentSkills);

        // Load internships
        const internshipData = await loadOpportunities(userId);
        setOpportunities(internshipData);
      } catch (error) {
        console.error(
          "Could not load recommendation data:",
          error
        );

        setError(
          error.message ||
            "Something went wrong while loading recommendations."
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
  // BEST OPPORTUNITY
  // =========================================================

  const bestOpportunity = useMemo(() => {
    if (opportunities.length === 0) {
      return null;
    }

    return [...opportunities].sort(
      (a, b) => getMatchScore(b) - getMatchScore(a)
    )[0];
  }, [opportunities]);

  // =========================================================
  // SKILL REQUIREMENTS
  // =========================================================

  const skillRequirements = useMemo(() => {
    if (
      !bestOpportunity ||
      !Array.isArray(bestOpportunity.skills)
    ) {
      return [];
    }

    return bestOpportunity.skills.map((skill) => {
      if (
        typeof skill === "object" &&
        skill !== null
      ) {
        return {
          name: skill.name,
          required: Number(skill.required || 0),
        };
      }

      return {
        name: skill,
        required: 70,
      };
    });
  }, [bestOpportunity]);

  // =========================================================
  // SKILL GAPS
  // =========================================================

  const gaps = useMemo(() => {
    return skillRequirements
      .map((skill) => {
        const current = getSkillLevel(skill.name);

        const gap = Math.max(
          skill.required - current,
          0
        );

        const percentage =
          skill.required > 0
            ? Math.round(
                Math.min(
                  (current / skill.required) * 100,
                  100
                )
              )
            : 100;

        return {
          name: skill.name,
          required: skill.required,
          current,
          gap,
          percentage,
        };
      })
      .sort((a, b) => b.gap - a.gap);
  }, [skillRequirements, skills]);

  // =========================================================
  // MISSING SKILLS
  // =========================================================

  const missingSkills = useMemo(() => {
    return gaps.filter((skill) => skill.gap > 0);
  }, [gaps]);

  // =========================================================
  // READINESS
  // =========================================================

  const readiness = useMemo(() => {
    if (skillRequirements.length === 0) {
      return 0;
    }

    const total = skillRequirements.reduce(
      (sum, skill) => {
        const current = getSkillLevel(skill.name);

        const percentage =
          skill.required > 0
            ? Math.min(
                (current / skill.required) * 100,
                100
              )
            : 100;

        return sum + percentage;
      },
      0
    );

    return Math.round(
      total / skillRequirements.length
    );
  }, [skillRequirements, skills]);

  // =========================================================
  // TOP RECOMMENDATIONS
  // =========================================================

  const topRecommendations = missingSkills.slice(0, 4);

  // =========================================================
  // ROADMAP
  // =========================================================

  const roadmap = topRecommendations.slice(0, 3);

  // =========================================================
  // PRIORITY
  // =========================================================

  const getPriority = (gap) => {
    if (gap >= 25) {
      return "High";
    }

    if (gap >= 10) {
      return "Medium";
    }

    return "Low";
  };

  // =========================================================
  // PRIORITY MESSAGE
  // =========================================================

  const getPriorityMessage = (gap) => {
    if (gap >= 25) {
      return "This skill is significantly below the opportunity requirement.";
    }

    if (gap >= 10) {
      return "Improving this skill should noticeably strengthen your match.";
    }

    return "A small improvement could help complete the requirement.";
  };

  // =========================================================
  // RECOMMENDED CAREER
  // =========================================================

  const recommendedRole = useMemo(() => {
    const java = getSkillLevel("Java");
    const sql = getSkillLevel("SQL");
    const javascript = getSkillLevel("JavaScript");
    const python = getSkillLevel("Python");
    const react = getSkillLevel("React");
    const springBoot = getSkillLevel("Spring Boot");

    if (
      java >= 70 &&
      sql >= 60 &&
      springBoot >= 60
    ) {
      return "Backend Developer";
    }

    if (
      java >= 70 &&
      sql >= 60
    ) {
      return "Backend Developer";
    }

    if (
      javascript >= 70 &&
      react >= 60
    ) {
      return "Frontend / React Developer";
    }

    if (javascript >= 70) {
      return "Web Developer";
    }

    if (
      python >= 70 &&
      sql >= 60
    ) {
      return "Data Analyst";
    }

    if (python >= 75) {
      return "Python Developer";
    }

    return "Software Developer";
  }, [skills]);

  // =========================================================
  // CAREER POTENTIAL
  // =========================================================

  const careerPotential =
    readiness >= 80
      ? "High"
      : readiness >= 60
      ? "Moderate"
      : "Developing";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page">
        <Sidebar />

        <div className="profile-main">
          <main className="profile-content">
            <section className="profile-card">
              <p>Loading AI recommendations...</p>
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
    <div className="profile-page">
      <Sidebar />

      <div className="profile-main">
        <main className="profile-content">

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* HEADER */}

          <section className="profile-header-card">
            <div className="large-avatar">
              🤖
            </div>

            <div className="profile-heading">
              <h1>AI Recommendations</h1>

              <p>
                Personalized career and learning
                recommendations based on your skills
                and available opportunities.
              </p>

              <span>
                AI-Powered Guidance
              </span>
            </div>
          </section>

          {/* TARGET OPPORTUNITY */}

          {bestOpportunity && (
            <section className="profile-card">
              <div className="profile-card-heading">
                <h3>
                  🎯 Best-Matching Opportunity
                </h3>

                <p>
                  AISIP selected this opportunity
                  because it currently has your
                  highest calculated skill match.
                </p>
              </div>

              <div className="career-info-grid">

                <div className="career-info-item">
                  <span>💼</span>

                  <div>
                    <small>Opportunity</small>

                    <strong>
                      {bestOpportunity.title}
                    </strong>
                  </div>
                </div>

                <div className="career-info-item">
                  <span>🏢</span>

                  <div>
                    <small>Company</small>

                    <strong>
                      {bestOpportunity.company}
                    </strong>
                  </div>
                </div>

                <div className="career-info-item">
                  <span>📈</span>

                  <div>
                    <small>Match Score</small>

                    <strong>
                      {getMatchScore(bestOpportunity)}%
                    </strong>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* CAREER RECOMMENDATION */}

          <section className="profile-card">
            <div className="profile-card-heading">
              <h3>
                🎯 Recommended Career Path
              </h3>

              <p>
                AISIP analyzes your current skill
                profile to suggest a suitable
                career direction.
              </p>
            </div>

            <div className="career-info-grid">

              <div className="career-info-item">
                <span>💻</span>

                <div>
                  <small>Recommended Role</small>

                  <strong>
                    {recommendedRole}
                  </strong>
                </div>
              </div>

              <div className="career-info-item">
                <span>📊</span>

                <div>
                  <small>Current Readiness</small>

                  <strong>
                    {readiness}%
                  </strong>
                </div>
              </div>

              <div className="career-info-item">
                <span>🚀</span>

                <div>
                  <small>Career Potential</small>

                  <strong>
                    {careerPotential}
                  </strong>
                </div>
              </div>

            </div>
          </section>

          {/* SKILLS TO LEARN */}

          <section className="profile-card">
            <div className="profile-card-heading">
              <h3>
                📚 Recommended Skills to Learn
              </h3>

              <p>
                These recommendations are generated
                from the largest gaps between your
                current skills and the requirements
                of your best-matching opportunity.
              </p>
            </div>

            {topRecommendations.length === 0 ? (

              <div
                style={{
                  padding: "20px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  color: "#166534",
                }}
              >
                🎉 Your current skills meet the
                requirements of the selected
                opportunity.
              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >

                {topRecommendations.map((skill) => (
                  <div
                    key={skill.name}
                    style={{
                      padding: "18px",
                      border: "1px solid #eee",
                      borderRadius: "10px",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >

                      <div>
                        <h4
                          style={{
                            margin: "0 0 5px 0",
                          }}
                        >
                          {skill.name}
                        </h4>

                        <p
                          style={{
                            margin: 0,
                            color: "#777",
                            fontSize: "13px",
                          }}
                        >
                          Current: {skill.current}%
                          {" • "}
                          Required: {skill.required}%
                        </p>
                      </div>

                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "20px",
                          background:
                            skill.gap >= 25
                              ? "#ffe0e0"
                              : skill.gap >= 10
                              ? "#fff4d6"
                              : "#e5f7ff",
                          color:
                            skill.gap >= 25
                              ? "#a22"
                              : skill.gap >= 10
                              ? "#856000"
                              : "#006a89",
                          fontWeight: "700",
                          fontSize: "12px",
                        }}
                      >
                        {getPriority(skill.gap)} Priority
                      </span>

                    </div>

                    <div
                      className="progress-bar"
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      <div
                        className="progress"
                        style={{
                          width: `${skill.percentage}%`,
                        }}
                      ></div>
                    </div>

                    <p
                      style={{
                        marginTop: "10px",
                        color: "#555",
                        fontSize: "13px",
                      }}
                    >
                      {getPriorityMessage(skill.gap)}
                    </p>

                  </div>
                ))}

              </div>

            )}
          </section>

          {/* LEARNING ROADMAP */}

          <section className="profile-card">
            <div className="profile-card-heading">
              <h3>
                🗺️ Personalized Learning Roadmap
              </h3>

              <p>
                Follow these steps in priority order
                to improve your match.
              </p>
            </div>

            {roadmap.length === 0 ? (

              <div className="career-info-grid">
                <div className="career-info-item">
                  <span>🎉</span>

                  <div>
                    <small>Status</small>

                    <strong>
                      Profile is on track
                    </strong>
                  </div>
                </div>
              </div>

            ) : (

              <div className="career-info-grid">

                {roadmap.map((skill, index) => (
                  <div
                    className="career-info-item"
                    key={skill.name}
                  >

                    <span>
                      {index + 1}️⃣
                    </span>

                    <div>
                      <small>
                        Step {index + 1}
                        {" • "}
                        {getPriority(skill.gap)}
                        {" Priority"}
                      </small>

                      <strong>
                        Learn {skill.name}
                      </strong>
                    </div>

                  </div>
                ))}

              </div>

            )}
          </section>

          {/* ALL OPPORTUNITIES */}

          <section className="profile-card">
            <div className="profile-card-heading">
              <h3>
                💼 Opportunity Recommendations
              </h3>

              <p>
                Available opportunities ranked by
                your calculated skill match.
              </p>
            </div>

            {opportunities.length === 0 ? (

              <p>
                No open opportunities are currently
                available.
              </p>

            ) : (

              <div className="opportunity-list">

                {opportunities
                  .slice(0, 5)
                  .map((opportunity) => (
                    <div
                      className="opportunity-card"
                      key={opportunity.id}
                    >

                      <div className="company-logo">
                        {String(
                          opportunity.company || "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="opportunity-info">

                        <h4>
                          {opportunity.title}
                        </h4>

                        <p>
                          {opportunity.company}
                          {" • "}
                          {opportunity.location}
                        </p>

                        <div className="tags">

                          {Array.isArray(
                            opportunity.skills
                          ) &&
                            opportunity.skills
                              .slice(0, 4)
                              .map((skill, index) => {

                                const name =
                                  typeof skill ===
                                    "object" &&
                                  skill !== null
                                    ? skill.name
                                    : skill;

                                return (
                                  <span
                                    key={
                                      name || index
                                    }
                                  >
                                    {name}
                                  </span>
                                );
                              })}

                        </div>
                      </div>

                      <div className="match-score">
                        <strong>
                          {getMatchScore(opportunity)}%
                        </strong>

                        <span>
                          Match
                        </span>
                      </div>

                    </div>
                  ))}

              </div>

            )}
          </section>

          {/* AI INSIGHT */}

          <section className="ai-card">
            <div className="ai-icon">
              🤖
            </div>

            <div className="ai-content">

              <p className="small-title">
                AISIP AI INSIGHT
              </p>

              <h3>
                {topRecommendations.length > 0
                  ? `Focus on ${topRecommendations[0].name} next`
                  : "Your skill profile is looking strong"}
              </h3>

              <p>
                {topRecommendations.length > 0
                  ? `Your current ${topRecommendations[0].name} level is ${topRecommendations[0].current}%, while the target requirement is ${topRecommendations[0].required}%. Closing this ${topRecommendations[0].gap}% gap can improve your readiness for ${bestOpportunity?.title || "matching opportunities"}.`
                  : "Your current skill profile meets the requirements of your best-matching opportunity. Continue developing your skills and keep your profile updated."}
              </p>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default AIRecommendations;