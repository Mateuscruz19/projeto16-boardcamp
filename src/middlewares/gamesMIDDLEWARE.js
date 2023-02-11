import { connectionDB } from "../database/db.js";
import { gameSchemma } from "../models/gamesJOI.js";

export async function schemaGames(req, res, next) {

    const game = req.body;
    const { name, categoryId } = req.body;

  const { error } = gameSchemma.validate(game, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).send({ errors });
  }

  const categoriesID = await connectionDB.query(
    "SELECT * FROM games WHERE id=$1",[categoryId]
  );


  const nameGame = await connectionDB.query(
    "SELECT * FROM games WHERE name=$1",[name]
  );

  if (nameGame.rowCount !== 0) return res.sendStatus(409);

  next();
}


