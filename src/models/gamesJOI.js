import joi from "joi";

export const gameSchemma = joi.object({
   name: joi.string().required(),
    stockTotal: joi.number().min(1).required(),
    pricePerDay: joi.number().min(1).required(),
    image: joi.string().uri().required(),
});
