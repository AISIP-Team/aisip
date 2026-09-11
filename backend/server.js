require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
// =========================================================
// EMAIL CONFIGURATION
// =========================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());

// =========================================================
// GET LOGGED-IN USER ID
// =========================================================

function getStudentId(req) {
  const userId = Number(
    req.headers["x-user-id"]
  );

  if (!userId || Number.isNaN(userId)) {
    return null;
  }

  return userId;
}

// =========================================================
// HOME
// =========================================================

app.get("/", (req, res) => {
  res.json({
    message: "AISIP backend is running!",
  });
});

// =========================================================
// SKILLS API
// =========================================================

// GET student's skills
app.get("/api/skills", (req, res) => {
  const userId = getStudentId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Student ID is required.",
    });
  }

  const query = `
    SELECT
      ss.student_skill_id AS id,
      s.skill_name AS name,
      ss.proficiency_level AS level
    FROM student_skills ss
    JOIN skills s
      ON ss.skill_id = s.skill_id
    JOIN student_profiles sp
      ON ss.student_id = sp.student_id
    WHERE sp.user_id = ?
    ORDER BY ss.student_skill_id
  `;

  db.query(
    query,
    [userId],
    (err, results) => {
      if (err) {
        console.error(
          "Error fetching skills:",
          err.message
        );

        return res.status(500).json({
          message:
            "Failed to fetch skills.",
          error: err.message,
        });
      }

      res.json(results);
    }
  );
});

// ADD student skill
app.post("/api/skills", (req, res) => {
  const userId = getStudentId(req);

  if (!userId) {
    return res.status(401).json({
      message:
        "Student ID is required.",
    });
  }

  const { name, level } = req.body;

  if (!name || level === undefined) {
    return res.status(400).json({
      message:
        "Skill name and level are required.",
    });
  }

  const skillName =
    String(name).trim();

  const numericLevel =
    Number(level);

  if (
    !skillName ||
    Number.isNaN(numericLevel) ||
    numericLevel < 0 ||
    numericLevel > 100
  ) {
    return res.status(400).json({
      message:
        "Skill name is required and level must be between 0 and 100.",
    });
  }

  const studentQuery = `
    SELECT student_id
    FROM student_profiles
    WHERE user_id = ?
    LIMIT 1
  `;

  db.query(
    studentQuery,
    [userId],
    (studentErr, studentResults) => {
      if (studentErr) {
        return res.status(500).json({
          message:
            "Failed to find student profile.",
          error:
            studentErr.message,
        });
      }

      if (studentResults.length === 0) {
        return res.status(404).json({
          message:
            "Student profile not found.",
        });
      }

      const actualStudentId =
        studentResults[0].student_id;

      const findSkillQuery = `
        SELECT skill_id
        FROM skills
        WHERE LOWER(skill_name) =
              LOWER(?)
        LIMIT 1
      `;

      db.query(
        findSkillQuery,
        [skillName],
        (findErr, skillResults) => {
          if (findErr) {
            return res.status(500).json({
              message:
                "Failed to find skill.",
              error:
                findErr.message,
            });
          }

          const addStudentSkill =
            (skillId) => {
              const insertQuery = `
                INSERT INTO student_skills
                (
                  student_id,
                  skill_id,
                  proficiency_level
                )
                VALUES (?, ?, ?)
              `;

              db.query(
                insertQuery,
                [
                  actualStudentId,
                  skillId,
                  numericLevel,
                ],
                (insertErr, result) => {
                  if (insertErr) {
                    if (
                      insertErr.code ===
                      "ER_DUP_ENTRY"
                    ) {
                      return res
                        .status(409)
                        .json({
                          message:
                            "You have already added this skill.",
                        });
                    }

                    console.error(
                      "Error adding student skill:",
                      insertErr.message
                    );

                    return res
                      .status(500)
                      .json({
                        message:
                          "Failed to add skill.",
                        error:
                          insertErr.message,
                      });
                  }

                  res.status(201).json({
                    message:
                      "Skill added successfully!",

                    skill: {
                      id:
                        result.insertId,
                      name:
                        skillName,
                      level:
                        numericLevel,
                    },
                  });
                }
              );
            };

          if (
            skillResults.length > 0
          ) {
            addStudentSkill(
              skillResults[0]
                .skill_id
            );
            return;
          }

          const createSkillQuery = `
            INSERT INTO skills
            (skill_name)
            VALUES (?)
          `;

          db.query(
            createSkillQuery,
            [skillName],
            (
              createErr,
              createResult
            ) => {
              if (createErr) {
                return res
                  .status(500)
                  .json({
                    message:
                      "Failed to create skill.",
                    error:
                      createErr.message,
                  });
              }

              addStudentSkill(
                createResult.insertId
              );
            }
          );
        }
      );
    }
  );
});

// DELETE student skill
app.delete(
  "/api/skills/:id",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const studentSkillId =
      Number(req.params.id);

    if (
      Number.isNaN(
        studentSkillId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid skill ID.",
      });
    }

    const query = `
      DELETE ss
      FROM student_skills ss
      JOIN student_profiles sp
        ON ss.student_id =
           sp.student_id
      WHERE ss.student_skill_id = ?
        AND sp.user_id = ?
    `;

    db.query(
      query,
      [
        studentSkillId,
        userId,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message:
              "Failed to delete skill.",
            error:
              err.message,
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "Skill not found.",
          });
        }

        res.json({
          message:
            "Skill deleted successfully!",
        });
      }
    );
  }
);

// UPDATE student skill
app.put(
  "/api/skills/:id",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const studentSkillId =
      Number(req.params.id);

    if (
      Number.isNaN(
        studentSkillId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid skill ID.",
      });
    }

    const {
      name,
      level,
    } = req.body;

    const numericLevel =
      level !== undefined
        ? Number(level)
        : undefined;

    if (
      numericLevel !==
        undefined &&
      (
        Number.isNaN(
          numericLevel
        ) ||
        numericLevel < 0 ||
        numericLevel > 100
      )
    ) {
      return res.status(400).json({
        message:
          "Skill level must be between 0 and 100.",
      });
    }

    const findQuery = `
      SELECT
        ss.skill_id
      FROM student_skills ss
      JOIN student_profiles sp
        ON ss.student_id =
           sp.student_id
      WHERE ss.student_skill_id = ?
        AND sp.user_id = ?
    `;

    db.query(
      findQuery,
      [
        studentSkillId,
        userId,
      ],
      (findErr, rows) => {
        if (findErr) {
          return res.status(500).json({
            message:
              "Failed to find skill.",
            error:
              findErr.message,
          });
        }

        if (rows.length === 0) {
          return res.status(404).json({
            message:
              "Skill not found.",
          });
        }

        const skillId =
          rows[0].skill_id;

        const finishUpdate =
          () => {
            if (
              numericLevel ===
              undefined
            ) {
              return res.json({
                message:
                  "Skill updated successfully!",
              });
            }

            const query = `
              UPDATE student_skills
              SET proficiency_level = ?
              WHERE student_skill_id = ?
            `;

            db.query(
              query,
              [
                numericLevel,
                studentSkillId,
              ],
              (updateErr) => {
                if (updateErr) {
                  return res
                    .status(500)
                    .json({
                      message:
                        "Failed to update skill.",
                      error:
                        updateErr.message,
                    });
                }

                res.json({
                  message:
                    "Skill updated successfully!",
                });
              }
            );
          };

        if (name !== undefined) {
          const cleanName =
            String(name).trim();

          if (!cleanName) {
            return res.status(400).json({
              message:
                "Skill name cannot be empty.",
            });
          }

          const query = `
            UPDATE skills
            SET skill_name = ?
            WHERE skill_id = ?
          `;

          db.query(
            query,
            [
              cleanName,
              skillId,
            ],
            (nameErr) => {
              if (nameErr) {
                return res
                  .status(500)
                  .json({
                    message:
                      "Failed to update skill name.",
                    error:
                      nameErr.message,
                  });
              }

              finishUpdate();
            }
          );
        } else {
          finishUpdate();
        }
      }
    );
  }
);

// =========================================================
// INTERNSHIPS + DYNAMIC MATCHING
// =========================================================

app.get(
  "/api/internships",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const studentQuery = `
      SELECT student_id
      FROM student_profiles
      WHERE user_id = ?
      LIMIT 1
    `;

    db.query(
      studentQuery,
      [userId],
      (
        studentErr,
        studentResults
      ) => {
        if (studentErr) {
          return res.status(500).json({
            message:
              "Failed to find student.",
            error:
              studentErr.message,
          });
        }

        if (
          studentResults.length ===
          0
        ) {
          return res.status(404).json({
            message:
              "Student profile not found.",
          });
        }

        const actualStudentId =
          studentResults[0]
            .student_id;

        const internshipQuery = `
          SELECT
            i.internship_id AS id,
            i.title,
            c.company_name AS company,
            i.location,
            i.work_type,
            i.opportunity_type,
            i.status
          FROM internships i
          JOIN companies c
            ON i.company_id =
               c.company_id
          WHERE i.status = 'open'
          ORDER BY i.created_at DESC
        `;

        db.query(
          internshipQuery,
          (
            internshipErr,
            internships
          ) => {
            if (internshipErr) {
              console.error(
                "Error fetching internships:",
                internshipErr.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to fetch internships.",
                  error:
                    internshipErr.message,
                });
            }

            if (
              internships.length ===
              0
            ) {
              return res.json([]);
            }

            const studentSkillQuery = `
              SELECT
                s.skill_name,
                ss.proficiency_level
              FROM student_skills ss
              JOIN skills s
                ON ss.skill_id =
                   s.skill_id
              WHERE ss.student_id = ?
            `;

            db.query(
              studentSkillQuery,
              [actualStudentId],
              (
                skillErr,
                studentSkills
              ) => {
                if (skillErr) {
                  return res
                    .status(500)
                    .json({
                      message:
                        "Failed to fetch student skills.",
                      error:
                        skillErr.message,
                    });
                }

                const studentSkillMap =
                  {};

                studentSkills.forEach(
                  (skill) => {
                    studentSkillMap[
                      skill.skill_name
                        .trim()
                        .toLowerCase()
                    ] = Number(
                      skill.proficiency_level
                    );
                  }
                );

                let completed = 0;
                let responseSent =
                  false;

                const finalInternships =
                  [];

                internships.forEach(
                  (internship) => {
                    const requiredSkillQuery = `
                      SELECT
                        s.skill_name,
                        isk.required_level
                      FROM internship_skills isk
                      JOIN skills s
                        ON isk.skill_id =
                           s.skill_id
                      WHERE isk.internship_id = ?
                      ORDER BY s.skill_name
                    `;

                    db.query(
                      requiredSkillQuery,
                      [internship.id],
                      (
                        requiredErr,
                        requiredSkills
                      ) => {
                        if (
                          requiredErr
                        ) {
                          console.error(
                            "Error fetching required skills:",
                            requiredErr.message
                          );

                          if (
                            !responseSent
                          ) {
                            responseSent =
                              true;

                            return res
                              .status(500)
                              .json({
                                message:
                                  "Failed to fetch internship skills.",
                                error:
                                  requiredErr.message,
                              });
                          }

                          return;
                        }

                        let totalRequired =
                          0;

                        let totalMatched =
                          0;

                        requiredSkills.forEach(
                          (
                            requiredSkill
                          ) => {
                            const requiredLevel =
                              Number(
                                requiredSkill.required_level
                              );

                            const skillName =
                              requiredSkill.skill_name
                                .trim()
                                .toLowerCase();

                            const studentLevel =
                              studentSkillMap[
                                skillName
                              ] || 0;

                            totalRequired +=
                              requiredLevel;

                            totalMatched +=
                              Math.min(
                                studentLevel,
                                requiredLevel
                              );
                          }
                        );

                        let matchScore =
                          0;

                        if (
                          totalRequired >
                          0
                        ) {
                          matchScore =
                            Math.round(
                              (
                                totalMatched /
                                totalRequired
                              ) *
                                100
                            );
                        }

                        finalInternships.push(
                          {
                            id:
                              internship.id,

                            title:
                              internship.title,

                            company:
                              internship.company,

                            location:
                              internship.location,

                            match:
                              matchScore,

                            work_type:
                              internship.work_type,

                            opportunity_type:
                              internship.opportunity_type,

                            status:
                              internship.status,

                            skills:
                              requiredSkills.map(
                                (
                                  skill
                                ) => ({
                                  name:
                                    skill.skill_name,

                                  required:
                                    Number(
                                      skill.required_level
                                    ),
                                })
                              ),
                          }
                        );

                        completed++;

                        if (
                          completed ===
                            internships.length &&
                          !responseSent
                        ) {
                          responseSent =
                            true;

                          finalInternships.sort(
                            (a, b) =>
                              b.match -
                              a.match
                          );

                          res.json(
                            finalInternships
                          );
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// =========================================================
// STUDENT APPLICATIONS API
// =========================================================

// GET current student's applications
app.get(
  "/api/applications",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const query = `
      SELECT
        a.application_id AS id,
        sp.student_id AS studentId,
        a.internship_id AS internshipId,
        i.title AS internshipTitle,
        c.company_name AS company,
        i.location,
        a.status,
        a.applied_at AS appliedAt
      FROM applications a
      JOIN student_profiles sp
        ON a.student_id =
           sp.student_id
      JOIN internships i
        ON a.internship_id =
           i.internship_id
      JOIN companies c
        ON i.company_id =
           c.company_id
      WHERE sp.user_id = ?
      ORDER BY a.applied_at DESC
    `;

    db.query(
      query,
      [userId],
      (err, results) => {
        if (err) {
          console.error(
            "Error fetching applications:",
            err.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to fetch applications.",
              error:
                err.message,
            });
        }

        res.json(results);
      }
    );
  }
);

// APPLY FOR INTERNSHIP
app.post(
  "/api/applications",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const {
      internshipId,
    } = req.body;

    if (
      internshipId ===
      undefined
    ) {
      return res.status(400).json({
        message:
          "internshipId is required.",
      });
    }

    const studentQuery = `
      SELECT student_id
      FROM student_profiles
      WHERE user_id = ?
      LIMIT 1
    `;

    db.query(
      studentQuery,
      [userId],
      (
        studentErr,
        studentResults
      ) => {
        if (studentErr) {
          return res.status(500).json({
            message:
              "Failed to find student.",
            error:
              studentErr.message,
          });
        }

        if (
          studentResults.length ===
          0
        ) {
          return res.status(404).json({
            message:
              "Student profile not found.",
          });
        }

        const actualStudentId =
          studentResults[0]
            .student_id;

        const internshipQuery = `
          SELECT
            internship_id,
            title,
            status
          FROM internships
          WHERE internship_id = ?
          LIMIT 1
        `;

        db.query(
          internshipQuery,
          [
            Number(
              internshipId
            ),
          ],
          (
            internshipErr,
            internships
          ) => {
            if (internshipErr) {
              return res
                .status(500)
                .json({
                  message:
                    "Failed to find internship.",
                  error:
                    internshipErr.message,
                });
            }

            if (
              internships.length ===
              0
            ) {
              return res
                .status(404)
                .json({
                  message:
                    "Internship not found.",
                });
            }

            if (
              internships[0]
                .status !== "open"
            ) {
              return res
                .status(400)
                .json({
                  message:
                    "This opportunity is closed.",
                });
            }

            const insertQuery = `
              INSERT INTO applications
              (
                student_id,
                internship_id,
                status
              )
              VALUES (?, ?, 'applied')
            `;

            db.query(
              insertQuery,
              [
                actualStudentId,
                Number(
                  internshipId
                ),
              ],
              (
                insertErr,
                result
              ) => {
                if (insertErr) {
                  if (
                    insertErr.code ===
                    "ER_DUP_ENTRY"
                  ) {
                    return res
                      .status(409)
                      .json({
                        message:
                          "You have already applied for this internship.",
                      });
                  }

                  console.error(
                    "Error creating application:",
                    insertErr.message
                  );

                  return res
                    .status(500)
                    .json({
                      message:
                        "Failed to submit application.",
                      error:
                        insertErr.message,
                    });
                }

                return res
                  .status(201)
                  .json({
                    message:
                      "Application submitted successfully!",

                    application: {
                      id:
                        result.insertId,

                      studentId:
                        actualStudentId,

                      internshipId:
                        Number(
                          internshipId
                        ),

                      internshipTitle:
                        internships[0]
                          .title,

                      status:
                        "applied",
                    },
                  });
              }
            );
          }
        );
      }
    );
  }
);

// =========================================================
// PROFILE API
// =========================================================

// GET profile
app.get(
  "/api/profile",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const query = `
      SELECT
        u.name,
        u.email,
        sp.phone,
        sp.college,
        sp.degree,
        sp.department,
        sp.graduation_year AS year,
        sp.career_interest AS career
      FROM student_profiles sp
      JOIN users u
        ON sp.user_id =
           u.user_id
      WHERE sp.user_id = ?
      LIMIT 1
    `;

    db.query(
      query,
      [userId],
      (err, results) => {
        if (err) {
          console.error(
            "Error fetching profile:",
            err.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to fetch profile.",
              error:
                err.message,
            });
        }

        if (
          results.length === 0
        ) {
          return res
            .status(404)
            .json({
              message:
                "Student profile not found.",
            });
        }

        res.json(
          results[0]
        );
      }
    );
  }
);

// UPDATE profile
app.put(
  "/api/profile",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Student ID is required.",
      });
    }

    const {
      name,
      email,
      phone,
      college,
      degree,
      department,
      year,
      career,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message:
          "Name and email are required.",
      });
    }

    const updateUserQuery = `
      UPDATE users
      SET
        name = ?,
        email = ?
      WHERE user_id = ?
    `;

    db.query(
      updateUserQuery,
      [
        name,
        email,
        userId,
      ],
      (userErr) => {
        if (userErr) {
          console.error(
            "Error updating user:",
            userErr.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to update profile.",
              error:
                userErr.message,
            });
        }

        const updateProfileQuery = `
          UPDATE student_profiles
          SET
            phone = ?,
            college = ?,
            degree = ?,
            department = ?,
            graduation_year = ?,
            career_interest = ?
          WHERE user_id = ?
        `;

        db.query(
          updateProfileQuery,
          [
            phone || "",
            college || "",
            degree || "",
            department || "",
            Number(year),
            career || "",
            userId,
          ],
          (profileErr) => {
            if (profileErr) {
              console.error(
                "Error updating student profile:",
                profileErr.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to update student profile.",
                  error:
                    profileErr.message,
                });
            }

            res.json({
              message:
                "Profile updated successfully!",

              profile: {
                name,
                email,
                phone,
                college,
                degree,
                department,
                year,
                career,
              },
            });
          }
        );
      }
    );
  }
);

// =========================================================
// REGISTER API
// =========================================================

app.post(
  "/api/register",
  (req, res) => {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and role are required.",
      });
    }

    const cleanName =
      String(name).trim();

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();

    if (
      ![
        "student",
        "company",
        "admin",
      ].includes(role)
    ) {
      return res.status(400).json({
        message:
          "Invalid role.",
      });
    }

    const checkQuery = `
      SELECT user_id
      FROM users
      WHERE email = ?
      LIMIT 1
    `;

    db.query(
      checkQuery,
      [cleanEmail],
      (
        checkErr,
        results
      ) => {
        if (checkErr) {
          console.error(
            "Error checking user:",
            checkErr.message
          );

          return res
            .status(500)
            .json({
              message:
                "Database error.",
              error:
                checkErr.message,
            });
        }

        if (
          results.length > 0
        ) {
          return res
            .status(409)
            .json({
              message:
                "User already exists.",
            });
        }

        const insertUserQuery = `
          INSERT INTO users
          (
            name,
            email,
            password_hash,
            role
          )
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertUserQuery,
          [
            cleanName,
            cleanEmail,
            password,
            role,
          ],
          (
            insertErr,
            result
          ) => {
            if (insertErr) {
              console.error(
                "Error registering user:",
                insertErr.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Registration failed.",
                  error:
                    insertErr.message,
                });
            }

            const userId =
              result.insertId;

            // STUDENT
            if (
              role === "student"
            ) {
              const profileQuery = `
                INSERT INTO student_profiles
                (
                  user_id,
                  college,
                  degree,
                  department,
                  graduation_year,
                  career_interest
                )
                VALUES (?, ?, ?, ?, ?, ?)
              `;

              db.query(
                profileQuery,
                [
                  userId,
                  "Your College Name",
                  "B.Sc. Computer Science",
                  "Computer Science",
                  2027,
                  "Software Development",
                ],
                (profileErr) => {
                  if (
                    profileErr
                  ) {
                    console.error(
                      "Error creating student profile:",
                      profileErr.message
                    );

                    return res
                      .status(500)
                      .json({
                        message:
                          "User created, but student profile creation failed.",
                        error:
                          profileErr.message,
                      });
                  }

                  return res
                    .status(201)
                    .json({
                      message:
                        "Registration successful!",

                      user: {
                        id: userId,
                        name:
                          cleanName,
                        email:
                          cleanEmail,
                        role,
                      },
                    });
                }
              );

              return;
            }

            // COMPANY
            if (
              role === "company"
            ) {
              const companyQuery = `
                INSERT INTO companies
                (
                  user_id,
                  company_name,
                  contact_email
                )
                VALUES (?, ?, ?)
              `;

              db.query(
                companyQuery,
                [
                  userId,
                  cleanName,
                  cleanEmail,
                ],
                (companyErr) => {
                  if (
                    companyErr
                  ) {
                    console.error(
                      "Error creating company:",
                      companyErr.message
                    );

                    return res
                      .status(500)
                      .json({
                        message:
                          "User created, but company profile creation failed.",
                        error:
                          companyErr.message,
                      });
                  }

                  return res
                    .status(201)
                    .json({
                      message:
                        "Registration successful!",

                      user: {
                        id: userId,
                        name:
                          cleanName,
                        email:
                          cleanEmail,
                        role,
                      },
                    });
                }
              );

              return;
            }

            // ADMIN
            return res
              .status(201)
              .json({
                message:
                  "Registration successful!",

                user: {
                  id: userId,
                  name:
                    cleanName,
                  email:
                    cleanEmail,
                  role,
                },
              });
          }
        );
      }
    );
  }
);

// =========================================================
// LOGIN API
// =========================================================

app.post(
  "/api/login",
  (req, res) => {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();

    const query = `
      SELECT
        user_id,
        name,
        email,
        password_hash,
        role
      FROM users
      WHERE email = ?
      LIMIT 1
    `;

    db.query(
      query,
      [cleanEmail],
      (err, results) => {
        if (err) {
          console.error(
            "Error during login:",
            err.message
          );

          return res
            .status(500)
            .json({
              message:
                "Database error.",
              error:
                err.message,
            });
        }

        if (
          results.length === 0
        ) {
          return res
            .status(401)
            .json({
              message:
                "Invalid email or password.",
            });
        }

        const user =
          results[0];

        // Temporary development comparison
        if (
          user.password_hash !==
          password
        ) {
          return res
            .status(401)
            .json({
              message:
                "Invalid email or password.",
            });
        }

        return res.json({
          message:
            "Login successful!",

          user: {
            id:
              user.user_id,
            name:
              user.name,
            email:
              user.email,
            role:
              user.role,
          },
        });
      }
    );
  }
);

// =========================================================
// COMPANY API
// =========================================================

// GET COMPANY PROFILE / COMPANY ID
app.get(
  "/api/company/profile",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID is required.",
      });
    }

    const query = `
      SELECT
        company_id AS id,
        company_name AS name,
        description,
        industry,
        location,
        website,
        contact_email AS email,
        contact_phone AS phone
      FROM companies
      WHERE user_id = ?
      LIMIT 1
    `;

    db.query(
      query,
      [userId],
      (err, results) => {
        if (err) {
          console.error(
            "Error fetching company profile:",
            err.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to fetch company profile.",
              error:
                err.message,
            });
        }

        if (
          results.length ===
          0
        ) {
          return res
            .status(404)
            .json({
              message:
                "Company profile not found.",
            });
        }

        res.json(
          results[0]
        );
      }
    );
  }
);

// =========================================================
// GET COMPANY OPPORTUNITIES
// =========================================================

app.get(
  "/api/company/internships",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID is required.",
      });
    }

    const query = `
      SELECT
        i.internship_id AS id,
        i.title,
        i.description,
        i.location,
        i.work_type AS workType,
        i.opportunity_type AS opportunityType,
        i.match_score AS matchScore,
        i.status,
        i.created_at AS createdAt
      FROM internships i
      JOIN companies c
        ON i.company_id =
           c.company_id
      WHERE c.user_id = ?
      ORDER BY i.created_at DESC
    `;

    db.query(
      query,
      [userId],
      (err, results) => {
        if (err) {
          console.error(
            "Error fetching company opportunities:",
            err.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to fetch company opportunities.",
              error:
                err.message,
            });
        }

        if (
          results.length ===
          0
        ) {
          return res.json([]);
        }

        let completed = 0;

        const finalOpportunities =
          [];

        results.forEach(
          (opportunity) => {
            const skillQuery = `
              SELECT
                s.skill_name AS name,
                isk.required_level AS required
              FROM internship_skills isk
              JOIN skills s
                ON isk.skill_id =
                   s.skill_id
              WHERE isk.internship_id = ?
              ORDER BY s.skill_name
            `;

            db.query(
              skillQuery,
              [opportunity.id],
              (
                skillErr,
                skills
              ) => {
                if (skillErr) {
                  console.error(
                    "Error fetching company opportunity skills:",
                    skillErr.message
                  );

                  return res
                    .status(500)
                    .json({
                      message:
                        "Failed to fetch opportunity skills.",
                      error:
                        skillErr.message,
                    });
                }

                finalOpportunities.push(
                  {
                    ...opportunity,

                    skills:
                      skills.map(
                        (
                          skill
                        ) => ({
                          name:
                            skill.name,

                          required:
                            Number(
                              skill.required
                            ),
                        })
                      ),
                  }
                );

                completed++;

                if (
                  completed ===
                  results.length
                ) {
                  res.json(
                    finalOpportunities
                  );
                }
              }
            );
          }
        );
      }
    );
  }
);

// =========================================================
// CREATE COMPANY OPPORTUNITY
// =========================================================

app.post(
  "/api/company/internships",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID is required.",
      });
    }

    const {
      title,
      description,
      location,
      workType,
      opportunityType,
      skills,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !workType ||
      !opportunityType
    ) {
      return res.status(400).json({
        message:
          "Title, description, location, work type and opportunity type are required.",
      });
    }

    if (
      ![
        "remote",
        "hybrid",
        "onsite",
      ].includes(workType)
    ) {
      return res.status(400).json({
        message:
          "Invalid work type.",
      });
    }

    if (
      ![
        "internship",
        "job",
      ].includes(
        opportunityType
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid opportunity type.",
      });
    }

    const companyQuery = `
      SELECT company_id
      FROM companies
      WHERE user_id = ?
      LIMIT 1
    `;

    db.query(
      companyQuery,
      [userId],
      (
        companyErr,
        companyResults
      ) => {
        if (companyErr) {
          console.error(
            "Error finding company:",
            companyErr.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to find company.",
              error:
                companyErr.message,
            });
        }

        if (
          companyResults.length ===
          0
        ) {
          return res
            .status(404)
            .json({
              message:
                "Company profile not found.",
            });
        }

        const companyId =
          companyResults[0]
            .company_id;

        const internshipQuery = `
          INSERT INTO internships
          (
            company_id,
            title,
            description,
            location,
            work_type,
            opportunity_type,
            match_score,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, 0, 'open')
        `;

        db.query(
          internshipQuery,
          [
            companyId,
            String(title).trim(),
            String(
              description
            ).trim(),
            String(
              location
            ).trim(),
            workType,
            opportunityType,
          ],
          (
            internshipErr,
            result
          ) => {
            if (internshipErr) {
              console.error(
                "Error creating opportunity:",
                internshipErr.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to create opportunity.",
                  error:
                    internshipErr.message,
                });
            }

            const internshipId =
              result.insertId;

            if (
              !Array.isArray(
                skills
              ) ||
              skills.length ===
                0
            ) {
              return res
                .status(201)
                .json({
                  message:
                    "Opportunity published successfully!",

                  opportunity: {
                    id:
                      internshipId,

                    title:
                      String(
                        title
                      ).trim(),

                    description:
                      String(
                        description
                      ).trim(),

                    location:
                      String(
                        location
                      ).trim(),

                    workType,

                    opportunityType,

                    status:
                      "open",

                    skills: [],
                  },
                });
            }

            const cleanSkills =
              skills
                .map(
                  (skill) => ({
                    name:
                      String(
                        skill.name ||
                          ""
                      ).trim(),

                    required:
                      Number(
                        skill.required
                      ),
                  })
                )
                .filter(
                  (skill) =>
                    skill.name &&
                    !Number.isNaN(
                      skill.required
                    ) &&
                    skill.required >=
                      0 &&
                    skill.required <=
                      100
                );

            if (
              cleanSkills.length ===
              0
            ) {
              return res
                .status(201)
                .json({
                  message:
                    "Opportunity published successfully!",

                  opportunity: {
                    id:
                      internshipId,

                    title:
                      String(
                        title
                      ).trim(),

                    description:
                      String(
                        description
                      ).trim(),

                    location:
                      String(
                        location
                      ).trim(),

                    workType,

                    opportunityType,

                    status:
                      "open",

                    skills: [],
                  },
                });
            }

            let completed = 0;
            let responseSent =
              false;

            cleanSkills.forEach(
              (skill) => {
                const findSkillQuery = `
                  SELECT skill_id
                  FROM skills
                  WHERE LOWER(skill_name) =
                        LOWER(?)
                  LIMIT 1
                `;

                db.query(
                  findSkillQuery,
                  [skill.name],
                  (
                    findErr,
                    skillResults
                  ) => {
                    if (
                      responseSent
                    ) {
                      return;
                    }

                    if (findErr) {
                      responseSent =
                        true;

                      return res
                        .status(500)
                        .json({
                          message:
                            "Failed to find skill.",
                          error:
                            findErr.message,
                        });
                    }

                    const saveSkill =
                      (skillId) => {
                        const insertQuery = `
                          INSERT INTO internship_skills
                          (
                            internship_id,
                            skill_id,
                            required_level
                          )
                          VALUES (?, ?, ?)
                        `;

                        db.query(
                          insertQuery,
                          [
                            internshipId,
                            skillId,
                            skill.required,
                          ],
                          (
                            insertErr
                          ) => {
                            if (
                              responseSent
                            ) {
                              return;
                            }

                            if (
                              insertErr
                            ) {
                              responseSent =
                                true;

                              console.error(
                                "Error saving internship skill:",
                                insertErr.message
                              );

                              return res
                                .status(
                                  500
                                )
                                .json({
                                  message:
                                    "Failed to save required skill.",
                                  error:
                                    insertErr.message,
                                });
                            }

                            completed++;

                            if (
                              completed ===
                              cleanSkills.length
                            ) {
                              responseSent =
                                true;

                              return res
                                .status(
                                  201
                                )
                                .json({
                                  message:
                                    "Opportunity published successfully!",

                                  opportunity: {
                                    id:
                                      internshipId,

                                    title:
                                      String(
                                        title
                                      ).trim(),

                                    description:
                                      String(
                                        description
                                      ).trim(),

                                    location:
                                      String(
                                        location
                                      ).trim(),

                                    workType,

                                    opportunityType,

                                    status:
                                      "open",

                                    skills:
                                      cleanSkills,
                                  },
                                });
                            }
                          }
                        );
                      };

                    if (
                      skillResults.length >
                      0
                    ) {
                      saveSkill(
                        skillResults[0]
                          .skill_id
                      );

                      return;
                    }

                    const createSkillQuery = `
                      INSERT INTO skills
                      (skill_name)
                      VALUES (?)
                    `;

                    db.query(
                      createSkillQuery,
                      [skill.name],
                      (
                        createErr,
                        createResult
                      ) => {
                        if (
                          responseSent
                        ) {
                          return;
                        }

                        if (
                          createErr
                        ) {
                          responseSent =
                            true;

                          return res
                            .status(
                              500
                            )
                            .json({
                              message:
                                "Failed to create skill.",
                              error:
                                createErr.message,
                            });
                        }

                        saveSkill(
                          createResult
                            .insertId
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// =========================================================
// COMPANY APPLICATION MANAGEMENT
// =========================================================

// GET applications received by the company
app.get(
  "/api/company/applications",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID is required.",
      });
    }

    const query = `
      SELECT
        a.application_id AS id,
        a.student_id AS studentId,
        a.internship_id AS internshipId,
        a.status,
        a.applied_at AS appliedAt,

        u.name AS studentName,
        u.email AS studentEmail,

        sp.college,
        sp.degree,
        sp.department,
        sp.graduation_year AS graduationYear,
        sp.career_interest AS careerInterest,

        i.title AS internshipTitle,
        i.location,
        i.work_type AS workType,
        i.opportunity_type AS opportunityType,

        c.company_name AS companyName

      FROM applications a

      JOIN student_profiles sp
        ON a.student_id =
           sp.student_id

      JOIN users u
        ON sp.user_id =
           u.user_id

      JOIN internships i
        ON a.internship_id =
           i.internship_id

      JOIN companies c
        ON i.company_id =
           c.company_id

      WHERE c.user_id = ?

      ORDER BY a.applied_at DESC
    `;

    db.query(
      query,
      [userId],
      (
        err,
        applications
      ) => {
        if (err) {
          console.error(
            "Error fetching company applications:",
            err.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to fetch company applications.",
              error:
                err.message,
            });
        }

        if (
          applications.length ===
          0
        ) {
          return res.json([]);
        }

        let completed = 0;

        const finalApplications =
          [];

        applications.forEach(
          (application) => {
            // Get student's skills
            const studentSkillQuery = `
              SELECT
                s.skill_name,
                ss.proficiency_level
              FROM student_skills ss
              JOIN skills s
                ON ss.skill_id =
                   s.skill_id
              WHERE ss.student_id = ?
            `;

            db.query(
              studentSkillQuery,
              [application.studentId],
              (
                studentSkillErr,
                studentSkills
              ) => {
                if (
                  studentSkillErr
                ) {
                  console.error(
                    "Error fetching student skills:",
                    studentSkillErr.message
                  );

                  return res
                    .status(500)
                    .json({
                      message:
                        "Failed to fetch student skills.",
                      error:
                        studentSkillErr.message,
                    });
                }

                // Get required skills
                const requiredSkillQuery = `
                  SELECT
                    s.skill_name,
                    isk.required_level
                  FROM internship_skills isk
                  JOIN skills s
                    ON isk.skill_id =
                       s.skill_id
                  WHERE isk.internship_id = ?
                `;

                db.query(
                  requiredSkillQuery,
                  [
                    application.internshipId,
                  ],
                  (
                    requiredSkillErr,
                    requiredSkills
                  ) => {
                    if (
                      requiredSkillErr
                    ) {
                      console.error(
                        "Error fetching required skills:",
                        requiredSkillErr.message
                      );

                      return res
                        .status(
                          500
                        )
                        .json({
                          message:
                            "Failed to fetch required skills.",
                          error:
                            requiredSkillErr.message,
                        });
                    }

                    // Create student skill map
                    const studentSkillMap =
                      {};

                    studentSkills.forEach(
                      (
                        skill
                      ) => {
                        studentSkillMap[
                          skill.skill_name
                            .trim()
                            .toLowerCase()
                        ] =
                          Number(
                            skill.proficiency_level
                          );
                      }
                    );

                    // Calculate match score
                    let totalRequired =
                      0;

                    let totalMatched =
                      0;

                    requiredSkills.forEach(
                      (
                        requiredSkill
                      ) => {
                        const skillName =
                          requiredSkill.skill_name
                            .trim()
                            .toLowerCase();

                        const requiredLevel =
                          Number(
                            requiredSkill.required_level
                          );

                        const studentLevel =
                          studentSkillMap[
                            skillName
                          ] || 0;

                        totalRequired +=
                          requiredLevel;

                        totalMatched +=
                          Math.min(
                            studentLevel,
                            requiredLevel
                          );
                      }
                    );

                    let matchScore =
                      0;

                    if (
                      totalRequired >
                      0
                    ) {
                      matchScore =
                        Math.round(
                          (
                            totalMatched /
                            totalRequired
                          ) *
                            100
                        );
                    }

                    finalApplications.push(
                      {
                        id:
                          application.id,

                        studentId:
                          application.studentId,

                        studentName:
                          application.studentName,

                        studentEmail:
                          application.studentEmail,

                        college:
                          application.college,

                        degree:
                          application.degree,

                        department:
                          application.department,

                        graduationYear:
                          application.graduationYear,

                        careerInterest:
                          application.careerInterest,

                        internshipId:
                          application.internshipId,

                        internshipTitle:
                          application.internshipTitle,

                        location:
                          application.location,

                        workType:
                          application.workType,

                        opportunityType:
                          application.opportunityType,

                        companyName:
                          application.companyName,

                        status:
                          application.status,

                        appliedAt:
                          application.appliedAt,

                        matchScore,

                        skills:
                          studentSkills.map(
                            (
                              skill
                            ) => ({
                              name:
                                skill.skill_name,

                              level:
                                Number(
                                  skill.proficiency_level
                                ),
                            })
                          ),

                        requiredSkills:
                          requiredSkills.map(
                            (
                              skill
                            ) => ({
                              name:
                                skill.skill_name,

                              required:
                                Number(
                                  skill.required_level
                                ),
                            })
                          ),
                      }
                    );

                    completed++;

                    if (
                      completed ===
                      applications.length
                    ) {
                      finalApplications.sort(
                        (
                          a,
                          b
                        ) =>
                          b.matchScore -
                          a.matchScore
                      );

                      res.json(
                        finalApplications
                      );
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// =========================================================
// UPDATE APPLICATION STATUS
// =========================================================

app.put(
  "/api/company/applications/:id",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID is required.",
      });
    }

    const applicationId =
      Number(req.params.id);

    if (
      Number.isNaN(
        applicationId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid application ID.",
      });
    }

    const { status } =
      req.body;

    const allowedStatuses = [
      "applied",
      "reviewing",
      "shortlisted",
      "rejected",
      "selected",
      "withdrawn",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid application status.",
      });
    }

    // Verify that this application belongs
    // to an internship owned by this company
    const checkQuery = `
      SELECT
        a.application_id
      FROM applications a

      JOIN internships i
        ON a.internship_id =
           i.internship_id

      JOIN companies c
        ON i.company_id =
           c.company_id

      WHERE a.application_id = ?
        AND c.user_id = ?

      LIMIT 1
    `;

    db.query(
      checkQuery,
      [
        applicationId,
        userId,
      ],
      (
        checkErr,
        rows
      ) => {
        if (checkErr) {
          console.error(
            "Error checking application:",
            checkErr.message
          );

          return res
            .status(500)
            .json({
              message:
                "Failed to verify application.",
              error:
                checkErr.message,
            });
        }

        if (
          rows.length ===
          0
        ) {
          return res
            .status(404)
            .json({
              message:
                "Application not found.",
            });
        }

        const updateQuery = `
          UPDATE applications
          SET status = ?
          WHERE application_id = ?
        `;

        db.query(
          updateQuery,
          [
            status,
            applicationId,
          ],
          (updateErr) => {
            if (updateErr) {
              console.error(
                "Error updating application:",
                updateErr.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to update application status.",
                  error:
                    updateErr.message,
                });
            }

            res.json({
              message:
                "Application status updated successfully.",

              application: {
                id:
                  applicationId,

                status,
              },
            });
          }
        );
      }
    );
  }
);
// =========================================================
// ADMIN APIs
// =========================================================

// GET ALL USERS
app.get(
  "/api/admin/users",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Admin user ID is required.",
      });
    }

    const checkAdminQuery = `
      SELECT user_id
      FROM users
      WHERE user_id = ?
        AND role = 'admin'
      LIMIT 1
    `;

    db.query(
      checkAdminQuery,
      [userId],
      (adminErr, adminResults) => {
        if (adminErr) {
          return res.status(500).json({
            message:
              "Failed to verify admin.",
            error:
              adminErr.message,
          });
        }

        if (
          adminResults.length === 0
        ) {
          return res.status(403).json({
            message:
              "Admin access required.",
          });
        }

        const query = `
          SELECT
            user_id AS id,
            name,
            email,
            role,
            created_at AS createdAt
          FROM users
          ORDER BY created_at DESC
        `;

        db.query(
          query,
          (err, results) => {
            if (err) {
              console.error(
                "Error fetching users:",
                err.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to fetch users.",
                  error:
                    err.message,
                });
            }

            res.json(results);
          }
        );
      }
    );
  }
);

// =========================================================
// GET ALL OPPORTUNITIES
// =========================================================

app.get(
  "/api/admin/internships",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Admin user ID is required.",
      });
    }

    const checkAdminQuery = `
      SELECT user_id
      FROM users
      WHERE user_id = ?
        AND role = 'admin'
      LIMIT 1
    `;

    db.query(
      checkAdminQuery,
      [userId],
      (
        adminErr,
        adminResults
      ) => {
        if (adminErr) {
          return res.status(500).json({
            message:
              "Failed to verify admin.",
            error:
              adminErr.message,
          });
        }

        if (
          adminResults.length === 0
        ) {
          return res.status(403).json({
            message:
              "Admin access required.",
          });
        }

        const query = `
          SELECT
            i.internship_id AS id,
            i.title,
            i.description,
            i.location,
            i.work_type AS workType,
            i.opportunity_type AS opportunityType,
            i.match_score AS matchScore,
            i.status,
            i.created_at AS createdAt,
            c.company_name AS company
          FROM internships i
          JOIN companies c
            ON i.company_id =
               c.company_id
          ORDER BY i.created_at DESC
        `;

        db.query(
          query,
          (err, results) => {
            if (err) {
              console.error(
                "Error fetching admin opportunities:",
                err.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to fetch opportunities.",
                  error:
                    err.message,
                });
            }

            res.json(results);
          }
        );
      }
    );
  }
);

// =========================================================
// GET ALL APPLICATIONS
// =========================================================

app.get(
  "/api/admin/applications",
  (req, res) => {
    const userId =
      getStudentId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Admin user ID is required.",
      });
    }

    const checkAdminQuery = `
      SELECT user_id
      FROM users
      WHERE user_id = ?
        AND role = 'admin'
      LIMIT 1
    `;

    db.query(
      checkAdminQuery,
      [userId],
      (
        adminErr,
        adminResults
      ) => {
        if (adminErr) {
          return res.status(500).json({
            message:
              "Failed to verify admin.",
            error:
              adminErr.message,
          });
        }

        if (
          adminResults.length === 0
        ) {
          return res.status(403).json({
            message:
              "Admin access required.",
          });
        }

        const query = `
          SELECT
            a.application_id AS id,
            a.student_id AS studentId,
            a.internship_id AS internshipId,

            a.status,
            a.applied_at AS appliedAt,

            u.name AS studentName,
            u.email AS studentEmail,

            sp.college,
            sp.degree,
            sp.department,
            sp.graduation_year AS graduationYear,
            sp.career_interest AS careerInterest,

            i.title AS internshipTitle,
            i.location,

            c.company_name AS companyName

          FROM applications a

          JOIN student_profiles sp
            ON a.student_id =
               sp.student_id

          JOIN users u
            ON sp.user_id =
               u.user_id

          JOIN internships i
            ON a.internship_id =
               i.internship_id

          JOIN companies c
            ON i.company_id =
               c.company_id

          ORDER BY a.applied_at DESC
        `;

        db.query(
          query,
          (
            applicationErr,
            applications
          ) => {
            if (applicationErr) {
              console.error(
                "Error fetching admin applications:",
                applicationErr.message
              );

              return res
                .status(500)
                .json({
                  message:
                    "Failed to fetch applications.",
                  error:
                    applicationErr.message,
                });
            }

            if (
              applications.length ===
              0
            ) {
              return res.json([]);
            }

            let completed = 0;

            const finalApplications =
              [];

            applications.forEach(
              (application) => {
                // Student skills
                const studentSkillQuery = `
                  SELECT
                    s.skill_name,
                    ss.proficiency_level
                  FROM student_skills ss
                  JOIN skills s
                    ON ss.skill_id =
                       s.skill_id
                  WHERE ss.student_id = ?
                `;

                db.query(
                  studentSkillQuery,
                  [
                    application.studentId,
                  ],
                  (
                    studentSkillErr,
                    studentSkills
                  ) => {
                    if (
                      studentSkillErr
                    ) {
                      console.error(
                        "Error fetching admin student skills:",
                        studentSkillErr.message
                      );

                      return res
                        .status(500)
                        .json({
                          message:
                            "Failed to fetch student skills.",
                          error:
                            studentSkillErr.message,
                        });
                    }

                    // Required internship skills
                    const requiredSkillQuery = `
                      SELECT
                        s.skill_name,
                        isk.required_level
                      FROM internship_skills isk
                      JOIN skills s
                        ON isk.skill_id =
                           s.skill_id
                      WHERE isk.internship_id = ?
                    `;

                    db.query(
                      requiredSkillQuery,
                      [
                        application.internshipId,
                      ],
                      (
                        requiredSkillErr,
                        requiredSkills
                      ) => {
                        if (
                          requiredSkillErr
                        ) {
                          console.error(
                            "Error fetching admin required skills:",
                            requiredSkillErr.message
                          );

                          return res
                            .status(
                              500
                            )
                            .json({
                              message:
                                "Failed to fetch required skills.",
                              error:
                                requiredSkillErr.message,
                            });
                        }

                        // Student skill map
                        const studentSkillMap =
                          {};

                        studentSkills.forEach(
                          (
                            skill
                          ) => {
                            studentSkillMap[
                              skill.skill_name
                                .trim()
                                .toLowerCase()
                            ] =
                              Number(
                                skill.proficiency_level
                              );
                          }
                        );

                        // Calculate match
                        let totalRequired =
                          0;

                        let totalMatched =
                          0;

                        requiredSkills.forEach(
                          (
                            requiredSkill
                          ) => {
                            const skillName =
                              requiredSkill.skill_name
                                .trim()
                                .toLowerCase();

                            const requiredLevel =
                              Number(
                                requiredSkill.required_level
                              );

                            const studentLevel =
                              studentSkillMap[
                                skillName
                              ] || 0;

                            totalRequired +=
                              requiredLevel;

                            totalMatched +=
                              Math.min(
                                studentLevel,
                                requiredLevel
                              );
                          }
                        );

                        let matchScore =
                          0;

                        if (
                          totalRequired >
                          0
                        ) {
                          matchScore =
                            Math.round(
                              (
                                totalMatched /
                                totalRequired
                              ) *
                                100
                            );
                        }

                        finalApplications.push(
                          {
                            id:
                              application.id,

                            studentId:
                              application.studentId,

                            internshipId:
                              application.internshipId,

                            studentName:
                              application.studentName,

                            studentEmail:
                              application.studentEmail,

                            college:
                              application.college,

                            degree:
                              application.degree,

                            department:
                              application.department,

                            graduationYear:
                              application.graduationYear,

                            careerInterest:
                              application.careerInterest,

                            internshipTitle:
                              application.internshipTitle,

                            location:
                              application.location,

                            companyName:
                              application.companyName,

                            status:
                              application.status,

                            appliedAt:
                              application.appliedAt,

                            matchScore,

                            skills:
                              studentSkills.map(
                                (
                                  skill
                                ) => ({
                                  name:
                                    skill.skill_name,

                                  level:
                                    Number(
                                      skill.proficiency_level
                                    ),
                                })
                              ),

                            requiredSkills:
                              requiredSkills.map(
                                (
                                  skill
                                ) => ({
                                  name:
                                    skill.skill_name,

                                  required:
                                    Number(
                                      skill.required_level
                                    ),
                                })
                              ),
                          }
                        );

                        completed++;

                        if (
                          completed ===
                          applications.length
                        ) {
                          finalApplications.sort(
                            (
                              a,
                              b
                            ) =>
                              b.matchScore -
                              a.matchScore
                          );

                          res.json(
                            finalApplications
                          );
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);
// =========================================================
// TEST EMAIL CONNECTION
// =========================================================

transporter.verify((error, success) => {
  if (error) {
    console.error(
      "Email configuration failed:",
      error.message
    );
  } else {
    console.log(
      "Email service connected successfully!"
    );
  }
});

// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {
  console.log(
    `AISIP backend running on http://localhost:${PORT}`
  );
});