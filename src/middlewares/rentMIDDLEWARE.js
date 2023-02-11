import { connectionDB } from "../database/db.js";
import { rentalsSchema } from "../models/rentalsJOI.js";

export async function validateRentals(req, res, next) {

    const { customerId, gameId, daysRented } = req.body;

    let avaiable = false;

    if (!validateBySchema(req.body, res, rentalsSchema)) return;

    try {
        const isExistentCustomerId = await connectionDB.query(
            "SELECT * FROM customers WHERE id = $1;",
            [customerId]
        );

        const isExistentGameId = await connectionDB.query(
            "SELECT * FROM games WHERE id = $1;",
            [gameId]
        );

        const stockTotal = await connectionDB.query(
            'SELECT "stockTotal" FROM games WHERE id = $1;',
            [gameId]
        );

        const rentTotal = await connectionDB.query(
            'SELECT * FROM rentals WHERE "gameId" = $1',
            [gameId]
        );

        if (
            stockTotal.rows[0]?.stockTotal &&
            stockTotal.rows[0].stockTotal - rentTotal.rows.length > 0
        )
            avaiable = true;

        if (
            isExistentCustomerId.rows.length === 0 ||
            isExistentGameId.rows.length === 0 ||
            daysRented <= 0 ||
            !avaiable
        ) {
            res.sendStatus(400);
            return;
        }

        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }

}
