import { Router } from "express";
import {Push,findAll,returnGame,remove} from "../controllers/rentalsCONTROLLER.js";
import {validSchemaRentals,gamesAvailableInStock} from "../middlewares/rentMIDDLEWARE.js";

const router = Router();

router.post("/rentals", validSchemaRentals, gamesAvailableInStock, Push);
router.get("/rentals", findAll);
router.post("/rentals/:id/return", returnGame);
router.delete("/rentals/:id", remove);

export default router;
