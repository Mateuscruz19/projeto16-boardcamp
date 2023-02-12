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
    const returnDate = new Date(Date.now())
    const { rentDate, daysRented, gameId } = req.rental.rows[0]

     const gamePrice = await connectionDB.query('SELECT * FROM games WHERE id = $1', [gameId])
     const pricePerDay = gamePrice.rows[0].pricePerDay

     const shouldReturnDate = structuredClone(rentDate)

     shouldReturnDate.setDate(shouldReturnDate.getDate() + daysRented)
 
     let Diff = 0
 
     if (shouldReturnDate.getTime() < returnDate.getTime()) {
 
         let timeDiff = returnDate.getTime() - shouldReturnDate.getTime();
 
         Diff = Math.floor(timeDiff / (1000 * 3600 * 24));
     }
 
     let daysDiff = Diff

    const delayFee = pricePerDay * daysDiff

        await connectionDB.query(
            `UPDATE rentals SET "delayFee" = $1, "returnDate" = $2 
            WHERE id = $3`,
            [delayFee, returnDate, id]
        )
        return res.sendStatus(200)

} catch (err) {
    console.log(err)
    return res.sendStatus(400)
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
