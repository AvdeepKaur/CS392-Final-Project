//avdeep
import express, { type Request, type Response } from "express";
import getCollection from "../db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
//import User from "../interfaces/User";
import jwt from "jsonwebtoken";

export interface User {
  _id: string;
  email: string;
  name: string;
  passwordHash?: string;
  favoriteLocationIds: string[];
}

interface Params {
  id: string;
}

// interface for the authenticated request containing userId
interface AuthRequest extends Request {
  userId?: string;
}

//token for authentication that i set myself :D
const JWT_KEY = process.env.JWT_SECRET;
if (!JWT_KEY) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Middleware to authenticate and extract user from JWT token
const authenticateJWT = (req: AuthRequest, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_KEY) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const router = express.Router();

// Get all users
router.get("/", async (_req: Request, res: Response) => {
  const collection = await getCollection("users");
  res.json(await collection.find({}).toArray());
});

// Get the logged-in user's favorites
router.get(
  "/favorites",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const userCollection = await getCollection("users");
    const locationCollection = await getCollection("locations");
    const user = await userCollection.findOne({
      _id: new ObjectId(req.userId),
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const favorites = await locationCollection
      .find({
        _id: {
          $in: user.favoriteLocationIds.map((id: string) => new ObjectId(id)),
        },
      })
      .toArray();

    res.json(favorites);
  }
);

// Add favorite
router.post(
  "/favorites/:locationId",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const userCollection = await getCollection("users");
    const { locationId } = req.params;
    await userCollection.updateOne(
      { _id: new ObjectId(req.userId) },
      { $addToSet: { favoriteLocationIds: locationId } }
    );
    res.json({ message: "Favorite added!" });
  }
);

// Remove favorite
router.delete(
  "/favorites/:locationId",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const userCollection = await getCollection("users");
    const { locationId } = req.params;
    await userCollection.updateOne({ _id: new ObjectId(req.userId) }, {
      $pull: { favoriteLocationIds: locationId },
    } as any);
    res.json({ message: "Favorite removed!" });
  }
);

//login with jwt token
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userCollection = await getCollection("users");
  const user = await userCollection.findOne({ email });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  // Sign JWT with user id
  const token = jwt.sign({ userId: user._id.toString() }, JWT_KEY, {
    expiresIn: "7d", // Token expires in 7 days!
  });

  res.json({ message: "Login successful", token });
});

//register a new user
router.post("/register", async (_req: Request, res: Response) => {
  const { email, name, password } = _req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const userCollection = await getCollection("users");

  // Check if email already exists and disable duplicate registrations
  const existing = await userCollection.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 12); //12 is the hashing rounds

  const result = await userCollection.insertOne({
    email,
    name,
    passwordHash,
    favoriteLocationIds: [],
  });

  res.status(201).json({ message: "User created", userId: result.insertedId });
});

// Current user route
router.get("/me", authenticateJWT, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userCollection = await getCollection("users");
  const user = await userCollection.findOne({ _id: new ObjectId(req.userId) });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { passwordHash, ...userSafe } = user;
  res.json(userSafe);
});

export default router;
