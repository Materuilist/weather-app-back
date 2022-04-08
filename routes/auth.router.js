import { Router } from "express";

import { getUser, signIn, signUp } from "../controllers/auth.controller.js";
import { parseUser } from "../controllers/shared.controller.js";

const router = Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.get("/get-user", parseUser, getUser);

export default router;
