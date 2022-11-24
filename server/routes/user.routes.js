import { Router } from "express";
import {
  isLoggedIn,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controllers.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/logout", logoutUser);

router.get("/user/me", isAuthenticated, isLoggedIn);

export default router;
