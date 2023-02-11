import { connectionDB } from "../database/db.js";

// ROUT GET

export async function Catch(req,res) {

    let query = "SELECT * FROM games"
    let parameters = []

    try {
       const games = await connectionDB.query(query, parameters)
        return res.send(games.rows)
    } catch (error) {
        res.status(500).send(error.message);
    }

}


// ROUT POST

export async function Push(req,res) {

    const { name, image, stockTotal, pricePerDay } = req.body;

    try {
        await connectionDB.query(
            'INSERT INTO games ("name", "image", "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4)',
            [name, image, stockTotal, pricePerDay]);

          res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}