import express, { application } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import gamesRoutes from "./routes/gamesROUTES.js";
import customersRoutes from "./routes/customersROUTES.js"
import rentalsRouter from "./routes/rentailsROUTES.js"

const app = express();
app.use(cors());
app.use(express.json());

app.use(gamesRoutes);
app.use(customersRoutes);
app.use(rentalsRouter);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running in port: ${port}`));