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
    return res.sendStatus(500)
}
}
export async function findAll(req, res) {
    const { customerId, gameId, order, desc, offset, limit, status, startDate } = req.query;

    let parameters = []
    let query = `
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
    let rentals = await connectionDB.query(query, parameters)

    if (status) rentals = filterRentalsByStatus(rentals, status)
    if (startDate) rentals = filterRentalsByStartDate(rentals, startDate)

    return res.send(rentals.rows)
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

    const daysDiff =  Math.floor(delayFee / (24 * 3600 * 1000));

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
