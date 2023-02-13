import { connectionDB } from "../database/db.js";
import dayjs from "dayjs";

export async function create(req, res) {
  const {
    customerId,
    gameId,
    daysRented,
    error,
  } = await validateStoreRentalsSchema(req.body);

  if (error) return res.status(error.code).send(error.message);

  try {
    let customer = await connectionDB.query('SELECT * FROM customers WHERE "id" = $1', [customerId]);
    customer = customer.rows[0];
    if (!customer) return res.sendStatus(409);

    let game = await connectionDB.query('SELECT * FROM games WHERE "id" = $1', [gameId]);
    game = game.rows[0];
    if (!game) return res.sendStatus(409);

    const quantityGameRented = await connectionDB.query('SELECT count(id) as quantity FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL', [game.id]);

    if (game.stockTotal <= quantityGameRented.rows[0].quantity) return res.sendStatus(400);

    const originalPrice = daysRented * game.pricePerDay;

    await connectionDB.query(
      'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, null, $5, null)',
      [customerId, gameId, dayjs().format(), daysRented, originalPrice],
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(400).send(err);
  }
}

export async function findAll(req, res) {

    const { customerId, gameId } = req.query;

    const query = `
    SELECT
    rentals.*,
    
    json_build_object(
        'id', customers.id,
        'name', customers."name"
    ) AS customer,
    json_build_object(
        'id', games.id,
        'name', games."name"
    ) AS game
    FROM rentals
    
    INNER JOIN customers ON rentals."customerId" = customers.id
    INNER JOIN games ON rentals."gameId" = games.id
`

  try {
    const { rows } = customerId
      ? await connectionDB.query(query + 'WHERE "customerId"=$1', [
          Number(customerId),
        ])
      : gameId
      ? await connectionDB.query(query + 'WHERE "gameId"=$1', [
          Number(gameId),
        ])
      : await connectionDB.query(query);

    res.send(rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
}



export async function remove(req, res) {
  const { id } = req.params;

  try {
    const result = await connectionDB.query(
      "SELECT * FROM rentals WHERE id=$1",
      [id]
    );

    const rental = result.rows[0];

    if (result.rowCount === 0) return res.sendStatus(404);
    if (!rental.returnDate) return res.sendStatus(400);

    await connectionDB.query("DELETE FROM rentals WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(400).send(err.message);
  }
}


export async function returnGame(req, res) {
    
  const { id } = req.params;

  try {
    let rental = await connectionDB.query('SELECT * FROM rentals WHERE "id" = $1', [id]);
    rental = rental.rows[0];
    if (!rental) return res.sendStatus(404);

    if (rental.returnDate) return res.sendStatus(400);

    const returnDate = dayjs().format();

    const dateExpiresAt = dayjs(rental.rentDate).add(rental.daysRented, 'day');

    let delayFee = null;

    const diffDays = dayjs().diff(dateExpiresAt, 'day');

    if (diffDays > 0) delayFee = diffDays * (rental.originalPrice / rental.daysRented);

    await connectionDB.query('UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE "id" = $3', [returnDate, delayFee, id]);

    return res.sendStatus(200);
  } catch (err) {
    return res.status(400).send(err);
  }
}
