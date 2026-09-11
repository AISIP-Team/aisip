import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

function Profile() {
  const [editing, setEditing] = useState(false);

 const [profile, setProfile] = useState({
  name: "Student",
  email: "student@example.com",
  phone: "",
  college: "Your College Name",
  degree: "B.Sc. Computer Science",
  department: "Computer Science",
  year: "2027",
  career: "Software Development",
  photo: "",
});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET LOGGED-IN USER
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
  // LOAD PROFILE
  // =========================================================

  const loadProfile = async () => {
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
        "http://localhost:5000/api/profile",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load profile."
        );
      }

      setProfile(data);
    } catch (error) {
      console.error(
        "Could not load profile:",
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
  // LOAD PROFILE WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);
  useEffect(() => {
  const savedPhoto = localStorage.getItem("aisipProfilePhoto");

  if (savedPhoto) {
    setProfile((previousProfile) => ({
      ...previousProfile,
      photo: savedPhoto,
    }));
  }
}, []);

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setError("Please select an image file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Profile photo must be smaller than 5 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const imageData = reader.result;

    setProfile((previousProfile) => ({
      ...previousProfile,
      photo: imageData,
    }));

    localStorage.setItem(
      "aisipProfilePhoto",
      imageData
    );

    setError("");
    setSuccess("Profile photo updated.");
  };

  reader.readAsDataURL(file);
};

const handleRemovePhoto = () => {
  localStorage.removeItem("aisipProfilePhoto");

  setProfile((previousProfile) => ({
    ...previousProfile,
    photo: "",
  }));

  setSuccess("Profile photo removed.");
  setError("");
};
  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const userId = getUserId();

      if (!userId) {
        setError(
          "You are not logged in. Please login again."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/profile",
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(profile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update profile."
        );
        return;
      }

      setProfile(data.profile);
      setEditing(false);
      setSuccess(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);

      // Keep localStorage name in sync
      try {
        const savedUser =
          localStorage.getItem("aisipUser");

        if (savedUser) {
          const user = JSON.parse(savedUser);

          localStorage.setItem(
            "aisipUser",
            JSON.stringify({
              ...user,
              name: data.profile.name,
              email: data.profile.email,
            })
          );
        }
      } catch (storageError) {
        console.error(
          "Could not update local user information:",
          storageError
        );
      }
    } catch (error) {
      console.error(
        "Could not save profile:",
        error
      );

      setError(
        "Cannot connect to the backend."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setSuccess("");
    loadProfile();
  };

  // =========================================================
  // PROFILE COMPLETION
  // =========================================================

  const profileFields = [
    profile.name,
    profile.email,
    profile.phone,
    profile.college,
    profile.degree,
    profile.department,
    profile.year,
    profile.career,
  ];

  const completedFields =
    profileFields.filter(
      (field) =>
        String(field || "").trim() !== ""
    ).length;

  const profileCompletion = Math.round(
    (completedFields /
      profileFields.length) *
      100
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-page premium-profile-page">

        <Sidebar />

        <div className="profile-main">

          <main className="profile-content">

            <section className="profile-loading-card">

              <div className="profile-loading-icon">
                ✦
              </div>

              <div>
                <h3>
                  Loading your profile...
                </h3>

                <p>
                  Getting your academic and career
                  information ready.
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
    <div className="profile-page premium-profile-page">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="profile-main">

        <main className="profile-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="profile-page-header">

            <div>

              <span className="profile-page-kicker">
                STUDENT PROFILE
              </span>

              <h1>
                Your professional profile
              </h1>

              <p>
                Keep your academic, personal and career
                information up to date.
              </p>

            </div>

            <div className="profile-header-badge">
              <span>✓</span>
              Profile connected to AISIP
            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="premium-profile-error">

              <span>!</span>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="premium-profile-success">

              <span>✓</span>

              <p>
                {success}
              </p>

            </div>
          )}

          {/* =================================================
              PROFILE HERO
          ================================================= */}

          <section className="profile-hero-card">

            <div className="profile-hero-left">

              <div className="profile-photo-wrapper">

  <div className="large-avatar premium-large-avatar profile-photo-avatar">

    {profile.photo ? (
      <img
        src={profile.photo}
        alt="Profile"
        className="profile-photo-image"
      />
    ) : (
      profile.name
        ? profile.name.charAt(0).toUpperCase()
        : "S"
    )}

  </div>

  {editing && (
    <div className="profile-photo-actions">

      <label
        htmlFor="profile-photo-input"
        className="profile-photo-upload-button"
      >
        📷 {profile.photo ? "Change Photo" : "Add Photo"}
      </label>

      <input
        id="profile-photo-input"
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        hidden
      />

      {profile.photo && (
        <button
          type="button"
          className="profile-photo-remove-button"
          onClick={handleRemovePhoto}
        >
          Remove
        </button>
      )}

      <small>
        Optional · JPG, PNG or WebP · Max 5 MB
      </small>

    </div>
  )}

</div>

              <div className="profile-heading">

                <div className="profile-role-badge">
                  STUDENT
                </div>

                <h1>
                  {profile.name}
                </h1>

                <p>
                  {profile.email}
                </p>

                <div className="profile-meta">

                  <span>
                    🎓 {profile.degree}
                  </span>

                  <span>
                    💻 {profile.department}
                  </span>

                  <span>
                    🎯 {profile.career}
                  </span>

                </div>

              </div>

            </div>

            <div className="profile-hero-right">

              <div className="profile-completion">

                <div className="completion-heading">

                  <span>
                    PROFILE COMPLETION
                  </span>

                  <strong>
                    {profileCompletion}%
                  </strong>

                </div>

                <div className="completion-track">

                  <div
                    className="completion-fill"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />

                </div>

                <small>
                  {profileCompletion >= 90
                    ? "Excellent! Your profile is complete."
                    : "Complete more fields to improve your AISIP profile."}
                </small>

              </div>

              {!editing && (
                <button
                  className="edit-profile-button premium-edit-button"
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  ✏️ Edit Profile
                </button>
              )}

            </div>

          </section>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="profile-card premium-profile-card">

            <div className="premium-profile-card-header">

              <div>

                <span className="profile-section-kicker">
                  PERSONAL DETAILS
                </span>

                <h3>
                  Personal Information
                </h3>

                <p>
                  Your basic information and contact details.
                </p>

              </div>

              <div className="profile-section-icon">
                ◉
              </div>

            </div>

            <div className="profile-form-grid premium-profile-form-grid">

              {/* NAME */}

              <div className="profile-field">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter your full name"
                />

              </div>

              {/* EMAIL */}

              <div className="profile-field">

                <label htmlFor="profile-email">
                  Email Address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter your email"
                />

              </div>

              {/* PHONE */}

              <div className="profile-field">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={!editing}
                />

              </div>

              {/* COLLEGE */}

              <div className="profile-field">

                <label htmlFor="college">
                  College / University
                </label>

                <input
                  id="college"
                  type="text"
                  name="college"
                  value={profile.college || ""}
                  onChange={handleChange}
                  placeholder="Your college or university"
                  disabled={!editing}
                />

              </div>

              {/* DEGREE */}

              <div className="profile-field">

                <label htmlFor="degree">
                  Degree
                </label>

                <input
                  id="degree"
                  type="text"
                  name="degree"
                  value={profile.degree || ""}
                  onChange={handleChange}
                  placeholder="Your degree"
                  disabled={!editing}
                />

              </div>

              {/* DEPARTMENT */}

              <div className="profile-field">

                <label htmlFor="department">
                  Department
                </label>

                <input
                  id="department"
                  type="text"
                  name="department"
                  value={
                    profile.department || ""
                  }
                  onChange={handleChange}
                  placeholder="Your department"
                  disabled={!editing}
                />

              </div>

              {/* GRADUATION YEAR */}

              <div className="profile-field">

                <label htmlFor="year">
                  Graduation Year
                </label>

                <select
                  id="year"
                  name="year"
                  value={
                    profile.year || "2027"
                  }
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="2026">
                    2026
                  </option>

                  <option value="2027">
                    2027
                  </option>

                  <option value="2028">
                    2028
                  </option>

                  <option value="2029">
                    2029
                  </option>
                </select>

              </div>

              {/* CAREER */}

              <div className="profile-field">

                <label htmlFor="career">
                  Career Interest
                </label>

                <select
                  id="career"
                  name="career"
                  value={
                    profile.career ||
                    "Software Development"
                  }
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="Software Development">
                    Software Development
                  </option>

                  <option value="Data Science">
                    Data Science
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="Cyber Security">
                    Cyber Security
                  </option>

                  <option value="AI & Machine Learning">
                    AI & Machine Learning
                  </option>
                </select>

              </div>

            </div>

            {/* =================================================
                EDIT ACTIONS
            ================================================= */}

            {editing && (
              <div className="premium-profile-actions">

                <button
                  type="button"
                  className="cancel-profile-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-profile-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="profile-save-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      ✓ Save Changes
                    </>
                  )}
                </button>

              </div>
            )}

          </section>

          {/* =================================================
              CAREER INFORMATION
          ================================================= */}

          <section className="profile-card premium-profile-card">

            <div className="premium-profile-card-header">

              <div>

                <span className="profile-section-kicker">
                  CAREER PROFILE
                </span>

                <h3>
                  Career Information
                </h3>

                <p>
                  This information helps AISIP recommend
                  more relevant opportunities.
                </p>

              </div>

              <div className="profile-section-icon violet-icon">
                ✦
              </div>

            </div>

            <div className="premium-career-grid">

              {/* EDUCATION */}

              <div className="premium-career-card">

                <div className="premium-career-icon">
                  🎓
                </div>

                <div>

                  <small>
                    EDUCATION
                  </small>

                  <strong>
                    {profile.degree ||
                      "Not specified"}
                  </strong>

                  <span>
                    {profile.college ||
                      "College not specified"}
                  </span>

                </div>

              </div>

              {/* DEPARTMENT */}

              <div className="premium-career-card">

                <div className="premium-career-icon">
                  💻
                </div>

                <div>

                  <small>
                    SPECIALIZATION
                  </small>

                  <strong>
                    {profile.department ||
                      "Not specified"}
                  </strong>

                  <span>
                    Graduation:{" "}
                    {profile.year ||
                      "Not specified"}
                  </span>

                </div>

              </div>

              {/* CAREER */}

              <div className="premium-career-card">

                <div className="premium-career-icon">
                  🎯
                </div>

                <div>

                  <small>
                    CAREER GOAL
                  </small>

                  <strong>
                    {profile.career ||
                      "Not specified"}
                  </strong>

                  <span>
                    AISIP recommendation profile
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              PROFILE INSIGHT
          ================================================= */}

          <section className="profile-insight-banner">

            <div className="profile-insight-icon">
              ✦
            </div>

            <div>

              <span>
                AISIP PROFILE INSIGHT
              </span>

              <h3>
                Keep your profile updated
              </h3>

              <p>
                Accurate academic and career information
                helps AISIP connect you with more relevant
                internships and job opportunities.
              </p>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Profile;