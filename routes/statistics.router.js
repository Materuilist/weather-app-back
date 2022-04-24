import { Router } from "express";

import { parseUser } from "../controllers/shared.controller.js";
import { getToday } from "../controllers/statistics.controller.js";

const router = Router();

router.post("/get-today", parseUser, getToday);

export default router;
