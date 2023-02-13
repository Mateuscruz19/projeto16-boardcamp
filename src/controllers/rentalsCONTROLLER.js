import { connectionDB } from "../database/db.js";
import dayjs from "dayjs";

export async function create(req, res) {
    const { customerId, gameId, daysRented } = req.body
    const rentDate = dayjs(Date.now()).format('YYYY-MM-DD')

  try {

    const gamePrice = await connectionDB.query('SELECT * FROM games WHERE id = $1', [gameId])
    const gamePricePerDay =  gamePrice.rows[0].pricePerDay    
    const originalPrice = gamePricePerDay * daysRented

    await connectionDB.query(
        `INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice") 
        VALUES ($1, $2, $3, $4, $5)`,
        [customerId, gameId, daysRented, rentDate, originalPrice])
    return res.sendStatus(201)

} catch (err) {
    console.log(err)
    return res.sendStatus(400)
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

export async function returnGame(req, res) {
    
  const { id } = req.params;

  try {
    let rental = await db.query('SELECT * FROM rentals WHERE "id" = $1', [id]);
    rental = rental.rows[0];
    if (!rental) return res.sendStatus(404);

    if (rental.returnDate) return res.sendStatus(400);

    const returnDate = dayjs().format();

    const dateExpiresAt = dayjs(rental.rentDate).add(rental.daysRented, 'day');

    let delayFee = null;

    const diffDays = dayjs().diff(dateExpiresAt, 'day');

    if (diffDays > 0) delayFee = diffDays * (rental.originalPrice / rental.daysRented);

    await db.query('UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE "id" = $3', [returnDate, delayFee, id]);

    return res.sendStatus(200);
  } catch (err) {
    return res.status(400).send(err);
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