import { Validation } from "src/utils/types";

export const PRODUCT_INPUT_VALIDATIONS: Validation[] = [
  {
    property: "quantity",
    validator: (value: number) => !isNaN(value),
    message: "Quantity of product is not a number",
  },
  {
    property: "quantity",
    validator: (value: number) => value > 0,
    message: "Quantity of product should be higher than 0",
  },
  {
    property: "value",
    validator: (value: number) => !isNaN(value),
    message: "Value of product is not a number",
  },
  {
    property: "value",
    validator: (value: number) => value > 0,
    message: "Value of product should be higher than 0",
  },
];

export const CASH_INPUT_VALIDATIONS = (
  cashAccepted: number[],
): Validation[] => [
  {
    property: "cash",
    validator: (value: number) => cashAccepted.includes(value),
    message: `The coin is not in the accepted list: ${cashAccepted}`,
  },
  {
    property: "amount",
    validator: (value: number) => !isNaN(value),
    message: "Invalid input: expected a number for cash amount.",
  },
  {
    property: "amount",
    validator: (value: number) => value > 0,
    message: "Invalid input: expected more than 0 for cash amount.",
  },
];
