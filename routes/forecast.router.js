import { Router } from "express";

import { assessOutfit } from "../controllers/forecast.controller.js";
import { parseUser } from "../controllers/shared.controller.js";

const router = Router();

router.post("/assess-outfit", parseUser, assessOutfit);

export default router;
