import { Router } from "express";

import { parseUser } from "../controllers/shared.controller.js";
import {
  getAllTime,
  getRecomendation,
  getToday,
} from "../controllers/statistics.controller.js";

const router = Router();

router.post("/get-today", parseUser, getToday);

router.post("/get-all-time", parseUser, getAllTime);

router.post("/get-recomendation", parseUser, getRecomendation);

export default router;
