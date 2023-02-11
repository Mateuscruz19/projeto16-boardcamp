import { Router } from "express";
import {
  create,
  findAll,
  findById,
  update,
} from "../controllers/customersCONTROLLER.js";
import { validSchemaCustomer } from "../middlewares/customersMIDDLEWARE.js";
const router = Router();

router.post("/customers", validSchemaCustomer, create);
router.get("/customers", findAll);
router.get("/customers/:id", findById);
router.put("/customers/:id", validSchemaCustomer, update);

export default router;
