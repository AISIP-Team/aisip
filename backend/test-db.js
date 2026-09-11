const db = require("./db");

console.log("Testing MySQL connection...");

db.query("SHOW TABLES", (err, results) => {
  if (err) {
    console.error("Database query failed:", err.message);
    return;
  }

  console.log("Tables in AISIP database:");
  console.table(results);

  db.end((endError) => {
    if (endError) {
      console.error("Could not close database connection:", endError.message);
      return;
    }

    console.log("Database connection closed.");
  });
});