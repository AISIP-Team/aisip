import CompanyApplications from "./CompanyApplications";
import CompanyDashboard from "./CompanyDashboard";
import AdminDashboard from "./AdminDashboard";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import StudentDashboard from "./StudentDashboard";
import Profile from "./Profile";
import Skills from "./Skills";
import SkillGap from "./SkillGap";
import Internships from "./Internships";
import AIRecommendations from "./AIRecommendations";
import Applications from "./Applications";

// =========================================================
// HOME PAGE
// =========================================================

function Home() {
  return (
    <div className="home-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="home-header">

        <h1>
          AISIP
        </h1>

        <nav>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#features">
            Features
          </a>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Get Started
          </Link>

        </nav>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="home-content">

        {/* LEFT SIDE */}

        <div className="home-text">

          <p className="small-title">
            AI-POWERED CAREER PLATFORM
          </p>

          <h2>
            Bridge
            <span>
              Academia & Industry
            </span>
          </h2>

          <p>
            AISIP helps students
            understand their skill
            gaps, discover
            industry-ready
            opportunities, and build
            a stronger path toward
            their careers.
          </p>

          <div className="home-buttons">

            <Link
              to="/register"
              className="primary-button"
            >
              Get Started
            </Link>

            <Link
              to="/internships"
              className="secondary-button"
            >
              Explore Opportunities
            </Link>

          </div>

        </div>


        {/* =================================================
            AI MATCH PREVIEW
        ================================================= */}

        <div className="home-card">

          <div
            style={{
              marginBottom: "24px",
            }}
          >

            <p
              style={{
                color: "#93c5fd",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              AISIP INTELLIGENCE
            </p>

            <h3
              style={{
                color: "white",
                fontSize: "22px",
                marginBottom: "5px",
              }}
            >
              AI Skill Match
            </h3>

            <p
              style={{
                color: "#aab6c8",
                fontSize: "12px",
              }}
            >
              See how your skills
              align with industry
              requirements.
            </p>

          </div>


          {/* MATCH SCORE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "28px",
            }}
          >

            <div
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                background:
                  "conic-gradient(#60a5fa 72%, rgba(255,255,255,0.08) 72%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                flexShrink: 0,
              }}
            >

              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#111c31",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >

                <strong
                  style={{
                    fontSize: "20px",
                    color: "white",
                  }}
                >
                  72%
                </strong>

                <span
                  style={{
                    fontSize: "8px",
                    color: "#93a4bd",
                  }}
                >
                  MATCH
                </span>

              </div>

            </div>


            <div>

              <strong
                style={{
                  color: "white",
                  fontSize: "15px",
                }}
              >
                Java Developer Intern
              </strong>

              <p
                style={{
                  color: "#93a4bd",
                  fontSize: "11px",
                  marginTop: "4px",
                }}
              >
                Tech Solutions • Remote
              </p>

            </div>

          </div>


          {/* JAVA */}

          <div
            style={{
              marginBottom: "15px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#dce6f3",
                fontSize: "11px",
                marginBottom: "6px",
              }}
            >

              <span>
                Java
              </span>

              <span>
                90%
              </span>

            </div>

            <div
              style={{
                height: "6px",
                borderRadius: "999px",
                background:
                  "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >

              <div
                style={{
                  width: "90%",
                  height: "100%",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg,#60a5fa,#818cf8)",
                }}
              />

            </div>

          </div>


          {/* SQL */}

          <div
            style={{
              marginBottom: "15px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#dce6f3",
                fontSize: "11px",
                marginBottom: "6px",
              }}
            >

              <span>
                SQL
              </span>

              <span>
                75%
              </span>

            </div>

            <div
              style={{
                height: "6px",
                borderRadius: "999px",
                background:
                  "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >

              <div
                style={{
                  width: "75%",
                  height: "100%",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg,#60a5fa,#818cf8)",
                }}
              />

            </div>

          </div>


          {/* GIT */}

          <div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#dce6f3",
                fontSize: "11px",
                marginBottom: "6px",
              }}
            >

              <span>
                Git
              </span>

              <span>
                0%
              </span>

            </div>

            <div
              style={{
                height: "6px",
                borderRadius: "999px",
                background:
                  "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >

              <div
                style={{
                  width: "0%",
                  height: "100%",
                }}
              />

            </div>

          </div>


          {/* AI INSIGHT */}

          <div
            style={{
              marginTop: "25px",
              padding: "13px",
              borderRadius: "10px",
              background:
                "rgba(124,58,237,0.13)",
              border:
                "1px solid rgba(167,139,250,0.15)",
            }}
          >

            <p
              style={{
                color: "#c4b5fd",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              🤖 AI Insight
            </p>

            <p
              style={{
                color: "#b9c5d7",
                fontSize: "10px",
                marginTop: "5px",
                lineHeight: "1.5",
              }}
            >
              Improve Git to strengthen
              your match with this
              opportunity.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          HOW AISIP WORKS
      ================================================= */}

      <section
        id="how-it-works"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding:
            "30px 45px 90px",
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "45px",
          }}
        >

          <p className="small-title">
            HOW AISIP WORKS
          </p>

          <h2
            style={{
              fontSize: "36px",
              marginTop: "8px",
              color: "#0b1220",
            }}
          >
            From Skills to Career
          </h2>

          <p
            style={{
              maxWidth: "620px",
              margin:
                "12px auto 0",
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "1.7",
            }}
          >
            AISIP connects student
            skills with real industry
            requirements through a
            simple intelligent
            workflow.
          </p>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5, 1fr)",
            gap: "12px",
          }}
        >

          {/* STEP 1 */}

          <div
            style={{
              textAlign: "center",
              padding:
                "20px 12px",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "18px",
                background:
                  "#eff6ff",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px",
              }}
            >
              🎓
            </div>

            <strong>
              Create Profile
            </strong>

            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "7px",
              }}
            >
              Add your education
              and career goals.
            </p>

          </div>


          {/* STEP 2 */}

          <div
            style={{
              textAlign: "center",
              padding:
                "20px 12px",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "18px",
                background:
                  "#f5f3ff",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px",
              }}
            >
              🧠
            </div>

            <strong>
              Add Skills
            </strong>

            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "7px",
              }}
            >
              Build your skill
              profile.
            </p>

          </div>


          {/* STEP 3 */}

          <div
            style={{
              textAlign: "center",
              padding:
                "20px 12px",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "18px",
                background:
                  "#eff6ff",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px",
              }}
            >
              🤖
            </div>

            <strong>
              AI Analysis
            </strong>

            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "7px",
              }}
            >
              Identify skill gaps
              automatically.
            </p>

          </div>


          {/* STEP 4 */}

          <div
            style={{
              textAlign: "center",
              padding:
                "20px 12px",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "18px",
                background:
                  "#f5f3ff",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px",
              }}
            >
              💼
            </div>

            <strong>
              Get Matched
            </strong>

            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "7px",
              }}
            >
              Discover relevant
              opportunities.
            </p>

          </div>


          {/* STEP 5 */}

          <div
            style={{
              textAlign: "center",
              padding:
                "20px 12px",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "18px",
                background:
                  "#ecfdf3",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px",
              }}
            >
              🚀
            </div>

            <strong>
              Launch Career
            </strong>

            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "7px",
              }}
            >
              Apply and move
              toward placement.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          AISIP ECOSYSTEM
      ================================================= */}

      <section
        id="features"
        style={{
          background:
            "linear-gradient(180deg,#f8fbff,#f4f7fb)",
          padding:
            "90px 45px",
        }}
      >

        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >

          <div
            style={{
              textAlign: "center",
              marginBottom: "50px",
            }}
          >

            <p className="small-title">
              ONE CONNECTED ECOSYSTEM
            </p>

            <h2
              style={{
                fontSize: "36px",
                marginTop: "8px",
                color: "#0b1220",
              }}
            >
              Connecting Students,
              Industry & Opportunity
            </h2>

          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 1fr",
              gap: "20px",
              alignItems: "center",
            }}
          >

            {/* STUDENT */}

            <div
              className="profile-card"
              style={{
                margin: 0,
                textAlign:
                  "center",
              }}
            >

              <div
                style={{
                  fontSize: "35px",
                  marginBottom:
                    "12px",
                }}
              >
                🎓
              </div>

              <h3>
                Students
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  marginTop:
                    "8px",
                  lineHeight:
                    "1.6",
                }}
              >
                Build profiles,
                understand skill
                gaps, discover
                opportunities and
                track applications.
              </p>

            </div>


            {/* AISIP AI */}

            <div
              style={{
                minHeight:
                  "250px",
                borderRadius:
                  "50%",
                background:
                  "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: "white",
                display:
                  "flex",
                flexDirection:
                  "column",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding:
                  "40px",
                boxShadow:
                  "0 25px 55px rgba(37,99,235,0.2)",
              }}
            >

              <div
                style={{
                  fontSize: "40px",
                  marginBottom:
                    "10px",
                }}
              >
                🤖
              </div>

              <strong
                style={{
                  fontSize:
                    "21px",
                }}
              >
                AISIP AI
              </strong>

              <span
                style={{
                  fontSize:
                    "10px",
                  opacity:
                    "0.8",
                  marginTop:
                    "5px",
                  textAlign:
                    "center",
                }}
              >
                Skill intelligence
                & opportunity
                matching
              </span>

            </div>


            {/* INDUSTRY */}

            <div
              className="profile-card"
              style={{
                margin: 0,
                textAlign:
                  "center",
              }}
            >

              <div
                style={{
                  fontSize:
                    "35px",
                  marginBottom:
                    "12px",
                }}
              >
                🏢
              </div>

              <h3>
                Industry
              </h3>

              <p
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "12px",
                  marginTop:
                    "8px",
                  lineHeight:
                    "1.6",
                }}
              >
                Publish
                internships and
                jobs, define
                skill requirements
                and find suitable
                candidates.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          FEATURES
      ================================================= */}

      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding:
            "90px 45px",
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "45px",
          }}
        >

          <p className="small-title">
            WHY AISIP
          </p>

          <h2
            style={{
              fontSize: "36px",
              marginTop: "8px",
              color: "#0b1220",
            }}
          >
            Built Around the
            Career Journey
          </h2>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "18px",
          }}
        >

          {/* FEATURE 1 */}

          <div className="dashboard-panel">

            <div className="stat-icon">
              🧠
            </div>

            <h3
              style={{
                marginTop:
                  "15px",
              }}
            >
              Skill Gap
              Intelligence
            </h3>

            <p
              style={{
                color:
                  "#64748b",
                fontSize:
                  "12px",
                marginTop:
                  "7px",
                lineHeight:
                  "1.6",
              }}
            >
              Understand exactly
              which skills you
              need to improve for
              your target
              opportunities.
            </p>

          </div>


          {/* FEATURE 2 */}

          <div className="dashboard-panel">

            <div className="stat-icon">
              🤖
            </div>

            <h3
              style={{
                marginTop:
                  "15px",
              }}
            >
              Smart Matching
            </h3>

            <p
              style={{
                color:
                  "#64748b",
                fontSize:
                  "12px",
                marginTop:
                  "7px",
                lineHeight:
                  "1.6",
              }}
            >
              Match student
              capabilities with
              real industry
              requirements using
              skill-based
              scoring.
            </p>

          </div>


          {/* FEATURE 3 */}

          <div className="dashboard-panel">

            <div className="stat-icon">
              🚀
            </div>

            <h3
              style={{
                marginTop:
                  "15px",
              }}
            >
              Placement Journey
            </h3>

            <p
              style={{
                color:
                  "#64748b",
                fontSize:
                  "12px",
                marginTop:
                  "7px",
                lineHeight:
                  "1.6",
              }}
            >
              Follow applications
              from the first
              submission through
              review, selection and
              placement.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section
        style={{
          padding:
            "80px 30px 100px",
          textAlign:
            "center",
        }}
      >

        <div
          style={{
            maxWidth:
              "900px",
            margin:
              "0 auto",
            padding:
              "55px 35px",
            borderRadius:
              "24px",

            background:
              "linear-gradient(135deg,#0b1220,#1b2a49)",

            color:
              "white",

            boxShadow:
              "0 25px 60px rgba(11,18,32,0.18)",
          }}
        >

          <p className="small-title">
            START YOUR JOURNEY
          </p>

          <h2
            style={{
              fontSize:
                "35px",
              margin:
                "12px 0",
            }}
          >
            Turn your skills
            into opportunities.
          </h2>

          <p
            style={{
              color:
                "#b8c4d5",
              fontSize:
                "13px",
              maxWidth:
                "570px",
              margin:
                "0 auto",
              lineHeight:
                "1.7",
            }}
          >
            Build your profile,
            discover your gaps,
            connect with industry
            and move closer to
            your next opportunity.
          </p>

          <div
            className="home-buttons"
            style={{
              justifyContent:
                "center",
            }}
          >

            <Link
              to="/register"
              className="primary-button"
            >
              Create Your Profile
            </Link>

            <Link
              to="/login"
              className="secondary-button"
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                border:
                  "1px solid rgba(255,255,255,0.15)",
                color:
                  "white",
              }}
            >
              Login
            </Link>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="home-footer">

        <p>
          © 2026 AISIP | Academia–Industry
          Skill Internship & Placement Portal
        </p>

      </footer>

    </div>
  );
}


// =========================================================
// APP ROUTES
// =========================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            STUDENT
        ================================================= */}

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/skills"
          element={<Skills />}
        />

        <Route
          path="/skill-gap"
          element={<SkillGap />}
        />

        <Route
          path="/internships"
          element={<Internships />}
        />

        <Route
          path="/ai-recommendations"
          element={<AIRecommendations />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />


        {/* =================================================
            COMPANY
        ================================================= */}

        <Route
          path="/company-dashboard"
          element={<CompanyDashboard />}
        />

        <Route
          path="/company-applications"
          element={<CompanyApplications />}
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;