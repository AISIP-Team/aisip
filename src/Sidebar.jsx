import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] =
    useState(null);

  // =========================================================
  // LOAD LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("aisipUser");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Could not load AISIP user:",
        error
      );
    }
  }, []);

  // =========================================================
  // USER ROLE
  // =========================================================

  const role =
    String(user?.role || "student")
      .toLowerCase();

  // =========================================================
  // USER NAME
  // =========================================================

  const displayName =
    user?.name ||
    (role === "company"
      ? "Company"
      : role === "admin"
        ? "Administrator"
        : "Student");

  // =========================================================
  // ROLE CONFIG
  // =========================================================

  const roleConfig = {
    student: {
      label: "Student Portal",
      icon: "🎓",

      items: [
        {
          path: "/student-dashboard",
          icon: "⌂",
          label: "Dashboard",
        },
        {
          path: "/profile",
          icon: "♙",
          label: "My Profile",
        },
        {
          path: "/skills",
          icon: "◆",
          label: "My Skills",
        },
        {
          path: "/skill-gap",
          icon: "◈",
          label: "Skill Gap Analysis",
        },
        {
          path: "/internships",
          icon: "▣",
          label: "Internships",
        },
        {
          path: "/ai-recommendations",
          icon: "✦",
          label: "AI Recommendations",
        },
        {
          path: "/applications",
          icon: "☷",
          label: "My Applications",
        },
      ],
    },

    company: {
      label: "Industry Portal",
      icon: "🏢",

      items: [
        {
          path: "/company-dashboard",
          icon: "⌂",
          label: "Dashboard",
        },
        {
          path: "/company-applications",
          icon: "☷",
          label: "Applications",
        },
        {
          path: "/profile",
          icon: "♙",
          label: "Company Profile",
        },
      ],
    },

    admin: {
      label: "Admin Portal",
      icon: "◉",

      items: [
        {
          path: "/admin-dashboard",
          icon: "⌂",
          label: "Dashboard",
        },
      ],
    },
  };

  const currentConfig =
    roleConfig[role] ||
    roleConfig.student;

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigate = (path) => {
    navigate(path);
  };

  // =========================================================
  // ACTIVE PAGE
  // =========================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "aisipUser"
    );

    navigate("/login");
  };

  // =========================================================
  // AVATAR LETTER
  // =========================================================

  const avatarLetter =
    String(displayName)
      .charAt(0)
      .toUpperCase();

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <aside className="sidebar aisip-sidebar">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="sidebar-brand">

        <button
          type="button"
          className="sidebar-logo-button"
          onClick={() =>
            handleNavigate(
              currentConfig.items[0].path
            )
          }
        >

          <div className="sidebar-logo-mark">
            A
          </div>

          <div className="sidebar-brand-text">

            <h1>
              AISIP
            </h1>

            <p>
              {currentConfig.label}
            </p>

          </div>

        </button>

      </div>

      {/* =====================================================
          PROFILE MINI CARD
      ===================================================== */}

      <div className="sidebar-user-card">

        <div className="sidebar-user-avatar">
          {avatarLetter}
        </div>

        <div className="sidebar-user-info">

          <strong>
            {displayName}
          </strong>

          <span>
            {role === "company"
              ? "Industry Partner"
              : role === "admin"
                ? "Platform Administrator"
                : "Student"}
          </span>

        </div>

        <div className="sidebar-online-dot"></div>

      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="sidebar-section-label">
        WORKSPACE
      </div>

      <nav className="sidebar-nav">

        {currentConfig.items.map(
          (item) => (
            <button
              type="button"
              key={item.path}
              className={
                isActive(
                  item.path
                )
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleNavigate(
                  item.path
                )
              }
            >

              <span className="sidebar-nav-icon">
                {item.icon}
              </span>

              <span className="sidebar-nav-label">
                {item.label}
              </span>

              {isActive(
                item.path
              ) && (
                <span className="sidebar-active-indicator"></span>
              )}

            </button>
          )
        )}

      </nav>

      {/* =====================================================
          AI PANEL
      ===================================================== */}

      {role !== "admin" && (
        <div className="sidebar-ai-card">

          <div className="sidebar-ai-orb">
            ✦
          </div>

          <div>

            <strong>
              AISIP AI
            </strong>

            <p>
              Skill intelligence
              powered career
              matching.
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          BOTTOM
      ===================================================== */}

      <div className="sidebar-bottom">

        <button
          type="button"
          className="sidebar-home-button"
          onClick={() =>
            navigate("/")
          }
        >

          <span>
            ◇
          </span>

          <span>
            AISIP Home
          </span>

        </button>

        <button
          type="button"
          className="sidebar-logout-button"
          onClick={
            handleLogout
          }
        >

          <span>
            ↪
          </span>

          <span>
            Sign Out
          </span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;