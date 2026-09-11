import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(50);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET LOGGED-IN USER ID
  // =========================================================

  const getUserId = () => {
    const savedUser = localStorage.getItem("aisipUser");

    if (!savedUser) {
      return null;
    }

    try {
      const user = JSON.parse(savedUser);

      if (!user.id) {
        return null;
      }

      return user.id;
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
  // LOAD SKILLS
  // =========================================================

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      if (!userId) {
        setError(
          "You are not logged in. Please login again."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/skills",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load skills."
        );
      }

      setSkills(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Could not load skills:",
        error
      );

      setError(
        error.message ||
          "Cannot connect to the backend. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadSkills();
  }, []);

  // =========================================================
  // ADD SKILL
  // =========================================================

  const addSkill = async (e) => {
    e.preventDefault();

    const name = skillName.trim();

    if (!name) {
      setError("Please enter a skill name.");
      return;
    }

    const userId = getUserId();

    if (!userId) {
      setError(
        "You are not logged in. Please login again."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/skills",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            name: name,
            level: Number(skillLevel),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to add skill."
        );
        return;
      }

      setSkills((currentSkills) => [
        ...currentSkills,
        data.skill,
      ]);

      setSkillName("");
      setSkillLevel(50);
    } catch (error) {
      console.error(
        "Could not add skill:",
        error
      );

      setError(
        "Cannot connect to the backend."
      );
    }
  };

  // =========================================================
  // REMOVE SKILL
  // =========================================================

  const removeSkill = async (id) => {
    const userId = getUserId();

    if (!userId) {
      setError(
        "You are not logged in. Please login again."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/skills/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to delete skill."
        );
        return;
      }

      setSkills((currentSkills) =>
        currentSkills.filter(
          (skill) => skill.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Could not delete skill:",
        error
      );

      setError(
        "Cannot connect to the backend."
      );
    }
  };

  // =========================================================
  // SKILL STATISTICS
  // =========================================================

  const averageLevel = useMemo(() => {
    if (skills.length === 0) {
      return 0;
    }

    const total = skills.reduce(
      (sum, skill) =>
        sum + Number(skill.level || 0),
      0
    );

    return Math.round(
      total / skills.length
    );
  }, [skills]);

  const strongestSkill = useMemo(() => {
    if (skills.length === 0) {
      return null;
    }

    return [...skills].sort(
      (a, b) =>
        Number(b.level || 0) -
        Number(a.level || 0)
    )[0];
  }, [skills]);

  const skillCategory = useMemo(() => {
    if (averageLevel >= 80) {
      return "Advanced";
    }

    if (averageLevel >= 60) {
      return "Intermediate";
    }

    if (averageLevel >= 40) {
      return "Developing";
    }

    return "Beginner";
  }, [averageLevel]);

  // =========================================================
  // LEVEL LABEL
  // =========================================================

  const getLevelLabel = (level) => {
    const value = Number(level);

    if (value >= 85) {
      return "Expert";
    }

    if (value >= 70) {
      return "Advanced";
    }

    if (value >= 50) {
      return "Intermediate";
    }

    if (value >= 30) {
      return "Developing";
    }

    return "Beginner";
  };

  // =========================================================
  // LEVEL CLASS
  // =========================================================

  const getLevelClass = (level) => {
    const value = Number(level);

    if (value >= 85) {
      return "skill-level-expert";
    }

    if (value >= 70) {
      return "skill-level-advanced";
    }

    if (value >= 50) {
      return "skill-level-intermediate";
    }

    return "skill-level-developing";
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="profile-page premium-skills-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="profile-main">

        <main className="profile-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="skills-page-header">

            <div>

              <span className="skills-page-kicker">
                AI SKILL LAB
              </span>

              <h1>
                Build your{" "}
                <span>
                  skill portfolio.
                </span>
              </h1>

              <p>
                Add your skills, track your proficiency
                and let AISIP understand where you can
                grow next.
              </p>

            </div>

            <div className="skills-header-orb">

              <div className="skills-orbit orbit-one"></div>

              <div className="skills-orbit orbit-two"></div>

              <div className="skills-orb-center">
                ✦
              </div>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="skills-error">

              <span>!</span>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              SKILL STATISTICS
          ================================================= */}

          <section className="skills-stats-grid">

            <div className="skills-stat-card">

              <div className="skills-stat-icon blue">
                ✦
              </div>

              <div>
                <small>
                  TOTAL SKILLS
                </small>

                <strong>
                  {skills.length}
                </strong>

                <span>
                  Skills in your portfolio
                </span>
              </div>

            </div>

            <div className="skills-stat-card">

              <div className="skills-stat-icon violet">
                ◉
              </div>

              <div>
                <small>
                  AVERAGE PROFICIENCY
                </small>

                <strong>
                  {averageLevel}%
                </strong>

                <span>
                  Overall skill strength
                </span>
              </div>

            </div>

            <div className="skills-stat-card">

              <div className="skills-stat-icon cyan">
                ↗
              </div>

              <div>
                <small>
                  CURRENT LEVEL
                </small>

                <strong>
                  {skillCategory}
                </strong>

                <span>
                  Based on your average
                </span>
              </div>

            </div>

            <div className="skills-stat-card">

              <div className="skills-stat-icon green">
                ★
              </div>

              <div>
                <small>
                  STRONGEST SKILL
                </small>

                <strong className="strongest-skill-name">
                  {strongestSkill
                    ? strongestSkill.name
                    : "—"}
                </strong>

                <span>
                  {strongestSkill
                    ? `${strongestSkill.level}% proficiency`
                    : "Add a skill to begin"}
                </span>
              </div>

            </div>

          </section>

          {/* =================================================
              ADD SKILL + AI TIP
          ================================================= */}

          <section className="skills-main-grid">

            {/* ADD SKILL */}

            <div className="premium-profile-card">

              <div className="premium-profile-card-header">

                <div>

                  <span className="profile-section-kicker">
                    SKILL PORTFOLIO
                  </span>

                  <h3>
                    Add a New Skill
                  </h3>

                  <p>
                    Tell AISIP what you can do.
                  </p>

                </div>

                <div className="profile-section-icon">
                  +
                </div>

              </div>

              <form
                onSubmit={addSkill}
                className="skill-add-form"
              >

                <div className="profile-field">

                  <label htmlFor="skillName">
                    Skill Name
                  </label>

                  <input
                    id="skillName"
                    type="text"
                    placeholder="e.g. Python, React, SQL"
                    value={skillName}
                    onChange={(e) =>
                      setSkillName(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="skill-range-section">

                  <div className="skill-range-heading">

                    <label htmlFor="skillLevel">
                      Proficiency Level
                    </label>

                    <strong>
                      {skillLevel}%
                    </strong>

                  </div>

                  <input
                    id="skillLevel"
                    className="premium-skill-range"
                    type="range"
                    min="0"
                    max="100"
                    value={skillLevel}
                    onChange={(e) =>
                      setSkillLevel(
                        Number(e.target.value)
                      )
                    }
                  />

                  <div className="range-labels">
                    <span>
                      Beginner
                    </span>

                    <span>
                      Intermediate
                    </span>

                    <span>
                      Advanced
                    </span>

                    <span>
                      Expert
                    </span>
                  </div>

                  <div className="skill-level-preview">

                    <div>
                      <span
                        className={`skill-preview-dot ${getLevelClass(
                          skillLevel
                        )}`}
                      ></span>

                      <strong>
                        {getLevelLabel(
                          skillLevel
                        )}
                      </strong>
                    </div>

                    <span>
                      {skillLevel}% confidence
                    </span>

                  </div>

                </div>

                <button
                  type="submit"
                  className="add-skill-premium-button"
                >
                  <span>
                    +
                  </span>

                  Add Skill
                </button>

              </form>

            </div>

            {/* AI TIP */}

            <div className="skill-ai-tip-card">

              <div className="skill-ai-tip-icon">
                ✦
              </div>

              <span>
                AISIP AI INSIGHT
              </span>

              <h3>
                Build skills with purpose.
              </h3>

              <p>
                Your skill levels are compared against
                industry requirements to identify gaps
                and improve your opportunity matches.
              </p>

              <div className="skill-ai-tip-points">

                <div>
                  <span>01</span>
                  Add skills honestly
                </div>

                <div>
                  <span>02</span>
                  Keep proficiency updated
                </div>

                <div>
                  <span>03</span>
                  Use AI recommendations
                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              CURRENT SKILLS
          ================================================= */}

          <section className="premium-profile-card">

            <div className="premium-profile-card-header">

              <div>

                <span className="profile-section-kicker">
                  YOUR PORTFOLIO
                </span>

                <h3>
                  Current Skills
                </h3>

                <p>
                  These skills are used by AISIP's
                  matching and skill-gap systems.
                </p>

              </div>

              <div className="skills-count-badge">
                {skills.length}{" "}
                {skills.length === 1
                  ? "skill"
                  : "skills"}
              </div>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="skills-loading">

                <div className="skills-spinner"></div>

                <p>
                  Loading your skills...
                </p>

              </div>

            ) : skills.length === 0 ? (

              /* EMPTY */

              <div className="skills-empty">

                <div className="skills-empty-icon">
                  ✦
                </div>

                <h4>
                  Your skill portfolio is empty
                </h4>

                <p>
                  Add your first skill above to start
                  building your AISIP career profile.
                </p>

              </div>

            ) : (

              /* SKILLS GRID */

              <div className="premium-skills-grid">

                {skills.map((skill) => {

                  const level =
                    Number(skill.level) || 0;

                  return (
                    <div
                      className="premium-skill-card"
                      key={skill.id}
                    >

                      <div className="premium-skill-card-top">

                        <div className="skill-card-symbol">
                          {String(
                            skill.name || "S"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <button
                          type="button"
                          className="remove-skill-button"
                          onClick={() =>
                            removeSkill(
                              skill.id
                            )
                          }
                          title="Remove skill"
                        >
                          ×
                        </button>

                      </div>

                      <h4>
                        {skill.name}
                      </h4>

                      <div className="skill-card-level-row">

                        <span>
                          {getLevelLabel(level)}
                        </span>

                        <strong>
                          {level}%
                        </strong>

                      </div>

                      <div className="skill-card-track">

                        <div
                          className="skill-card-fill"
                          style={{
                            width: `${Math.min(
                              level,
                              100
                            )}%`,
                          }}
                        ></div>

                      </div>

                      <div className="skill-card-footer">

                        <span>
                          Proficiency
                        </span>

                        <span
                          className={`skill-level-badge ${getLevelClass(
                            level
                          )}`}
                        >
                          {level >= 70
                            ? "Strong"
                            : level >= 50
                              ? "Growing"
                              : "Needs Work"}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </section>

          {/* =================================================
              AI ANALYSIS CTA
          ================================================= */}

          <section className="skills-analysis-banner">

            <div className="skills-analysis-icon">
              ✦
            </div>

            <div>

              <span>
                NEXT STEP
              </span>

              <h3>
                See how your skills compare with industry.
              </h3>

              <p>
                Explore your skill gaps and discover the
                technologies you should focus on next.
              </p>

            </div>

            <a
              href="/skill-gap"
              className="skills-analysis-button"
            >
              Analyze My Skill Gap →
            </a>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Skills;