import express from "express";
import locationsRoute from "../src/api/locations";
import cors from "cors";
import getCollection from "../src/db";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test database connection on startup
async function testDB() {
  try {
    console.log("Testing database connection...");
    const collection = await getCollection("locations");
    const count = await collection.countDocuments();
    console.log(
      `Database connected! Found ${count} documents in locations collection`
    );
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDB();

// debugging
console.log("Setting up routes...");
app.use("/api/locations", locationsRoute);

// a test route to make sure the server is working
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// a catch-all to see what routes are being requested
app.use("*", (req, res) => {
  console.log("Route not found:", req.method, req.originalUrl);
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
