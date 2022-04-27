import { Router } from "express";

import { parseUser } from "../controllers/shared.controller.js";
import { getAllTime, getToday } from "../controllers/statistics.controller.js";

const router = Router();

router.post("/get-today", parseUser, getToday);

router.post("/get-all-time", parseUser, getAllTime);

export default router;
