import { connectionDB } from "../database/db.js";

export async function create(req, res) {
  const {
    customerId,
    gameId,
    daysRented,
    rentDate,
    originalPrice,
    returnDate,
    delayFee,
  } = res.locals.rental;

  try {
    await connectionDB.query(
      `INSERT INTO rentals ("customerId","gameId","daysRented", "rentDate", "originalPrice", "returnDate", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        customerId,
        gameId,
        daysRented,
        rentDate,
        originalPrice,
        returnDate,
        delayFee,
      ]
    );

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
export async function findAll(req, res) {
  const { customerId, gameId } = req.query;

  const queryGlobal = `
    SELECT rentals.*, 
        customers.id AS "idCustomer", 
        customers.name AS "customerName", 
        games.id AS "idGame", 
        games.name AS "gameName"
    FROM
        rentals
    JOIN
        customers
    ON
        rentals."customerId" = customers.id
    JOIN
        games
    ON
        games.id = rentals."gameId"
  `;

  try {
    const { rows } = customerId
      ? await connectionDB.query(queryGlobal + 'WHERE "customerId"=$1', [
          Number(customerId),
        ])
      : gameId
      ? await connectionDB.query(queryGlobal + 'WHERE "gameId"=$1', [
          Number(gameId),
        ])
      : await connectionDB.query(queryGlobal);

    res.send(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
export async function returnGame(req, res) {
  const { id } = req.params;

  try {
    const result = await connectionDB.query(
      "SELECT * FROM rentals WHERE id=$1",
      [id]
    );

    const rental = result.rows[0];

    if (result.rowCount === 0) return res.sendStatus(404);
    if (rental.returnDate) return res.sendStatus(400);

    const diffInTime =
      new Date().getTime() - new Date(rental.rentDate).getTime();
    const diffInDays = Math.floor(diffInTime / (24 * 3600 * 1000));

    let delayFee = 0;
    if (diffInDays > rental.daysRented) {
      const addicionalDays = diffInDays - rental.daysRented;
      delayFee = addicionalDays * rental.originalPrice;
    }

    await connectionDB.query(
      `
        UPDATE rentals
        SET "returnDate" = NOW(), "delayFee" = $1
        WHERE id=$2
     `,
      [delayFee, id]
    );

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
  }
}
