import joi from "joi";

export const rentalSchemma = joi.object({
  customerId: joi.number().required(),
  gameId: joi.number().required(),
  rentDate: joi.date().required(),
  daysRented: joi.number().positive().required(),
  returnDate: joi.date().allow(null),
  originalPrice: joi.number().required(),
  delayFee: joi.number().allow(null),
});
