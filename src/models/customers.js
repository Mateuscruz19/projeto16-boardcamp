import joi from "joi";

export const customerSchemma = joi.object({
  name: joi.string().min(2).required(),
  phone: joi.string().regex(/^[0-9]+$/).min(10).max(11).required(),
  cpf: joi.string().regex(/^[0-9]+$/).min(11).max(11).required(),
  birthday: joi.required(),
});
