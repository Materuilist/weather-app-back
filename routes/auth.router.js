import { Router } from "express";

import { getUser, signIn, signUp } from "../controllers/auth.controller.js";
import { parseUser } from "../controllers/shared.controller.js";

const router = Router();

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

router.get("/get-user", parseUser, getUser);

export default router;
