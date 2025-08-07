//avdeep
import express, { type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import getCollection from "../db";
//import Location from "../interfaces/Location";

const router = express.Router();

console.log("Loading locations router...");

// GET /api/locations - get all locations
router.get("/", async (_req: Request, res: Response) => {
  console.log("GET /api/locations called");
  try {
    const collection = await getCollection("locations");
    console.log("Got collection:", collection.collectionName);
    const allLocations = await collection.find({}).toArray();
    console.log("Found locations:", allLocations.length);
    res.json(allLocations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// GET /api/locations/test - test route
router.get("/test", async (_req: Request, res: Response) => {
  console.log("GET /api/locations/test called");
  res.json({
    message: "Router is working!",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/locations/:id - get single location
router.get("/:id", async (req: Request, res: Response) => {
  console.log("GET /api/locations/:id called with id:", req.params.id);
  try {
    const collection = await getCollection("locations");
    const id = new ObjectId(req.params.id);
    const location = await collection.findOne({ _id: id });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ error: "Error fetching location" });
  }
});

// POST /api/locations - create new location
router.post("/", async (req: Request, res: Response) => {
  console.log("POST /api/locations called with body:", req.body);
  try {
    const collection = await getCollection("locations");
    const newLocation = req.body;

    const result = await collection.insertOne(newLocation);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ error: "Error creating location" });
  }
});

export default router;
