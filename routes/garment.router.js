import { Router } from "express";

import {
  addGarment,
  addToWardrobe,
  getGarments,
  removeFromWardrobe,
} from "../controllers/garment.controller.js";
import { parseUser } from "../controllers/shared.controller.js";

const router = Router();

router.get("/get-all", parseUser, getGarments);

router.post("/add", addGarment);

router.post("/add-to-wardrobe", parseUser, addToWardrobe);

router.post("/remove-from-wardrobe", parseUser, removeFromWardrobe);

export default router;
