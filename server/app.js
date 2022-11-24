import * as dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://mern-auth-svj.up.railway.app/"],
  optionsSuccessStatus: 200,
  credentials: true,
};

// Built in middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// External middlewares
app.use(cors(corsOptions));
app.use(cookieParser());

// Dummy route
app.get("/", (_req, res) => {
  res.send("Hello from backend");
});

// Importing all routes
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1", userRoutes);

export default app;
