import { connectionDB } from "../database/db.js";

export async function create(req, res) {
  const { name, phone, cpf, birthday } = res.locals.customer;

  
  try {
    await connectionDB.query(
      "INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)",
      [name, phone, cpf, birthday]
    );

    res.sendStatus(201);
  } catch (err) {
    res.status(400).send(err.message);
  }
}
export async function findAll(req, res) {
  const { cpf } = req.query;
  try {
    let customers;
    if (cpf) {
      customers = await connectionDB.query(
        `SELECT * FROM customers WHERE cpf LIKE '%' || $1 || '%' `,
        [cpf]
      );

      return res.send(customers.rows);
    }

    customers = await connectionDB.query(`SELECT * FROM customers`);
    res.send(customers.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
}

export async function findById(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await connectionDB.query(
      `SELECT * FROM customers WHERE id = $1 `,
      [id]
    );

    if (rows.length === 0) {
      return res.sendStatus(404);
    }

    res.send(rows[0]);
  } catch (err) {
    res.status(400).send(err.message);
  }
}
export async function update(req, res) {
  const { name, phone, cpf, birthday } = res.locals.customer;
  const { id } = req.params;

  
  try {
    await connectionDB.query(
      "UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id = $5",
      [name, phone, cpf, birthday, id]
    );

    res.sendStatus(200);
  } catch (err) {
    res.status(400).send(err.message);
  }
}
