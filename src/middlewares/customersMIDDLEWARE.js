import { customerSchemma } from "../models/customers.js";
import { connectionDB } from "../database/db.js";

export async function validSchemaCustomer(req, res, next) {
  const customer = req.body;

  const { error } = customerSchemma.validate(customer, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).send({ errors });
  }

  const cpfCustomerExists = await connectionDB.query(
    "SELECT * FROM customers WHERE cpf=$1",
    [customer.cpf]
  );

  if (
    cpfCustomerExists.rowCount !== 0 &&
    cpfCustomerExists.rows[0].id !== Number(req.params.id)
  ) {
    return res.sendStatus(409);
  }

  res.locals.customer = customer;

  next();
}
