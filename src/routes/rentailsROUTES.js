import { checkOut, create, deleteOne, findAll } from "../controllers/rentalsCONTROLLER.js";
import express from 'express';
import { validateRentals } from "../middlewares/rentMIDDLEWARE.js";

const router = express.Router();

router.post("/rentals", validateRentals, create);
router.get("/rentals", findAll);
router.delete("/rentals/:id", deleteOne)
router.post("/rentals/:id/return",checkOut)

export default router;