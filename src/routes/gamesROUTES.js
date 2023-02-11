import { Router } from "express";
import { Push, Catch } from "../controllers/gamesCONTROLLER.js";
import { schemaGames } from "../middlewares/gamesMIDDLEWARE.js";

const router = Router();

router.get("/games", Catch);
router.post("/games", schemaGames, Push);


export default router;