import { FloatOperations } from "src/utils";
import { VendingMachine } from "src/vending-machine";
import { Inventory, Session } from "src/vending-machine/types";

export const ACCEPTED_CASH = [2, 1, 0.5, 0.2, 0.1, 0.05];

export const initVendingMachine = (options?: {
  selected?: {
    [key: string]: number;
  };
  payed?: Map<number, number>;
  products?: {
    // eslint-disable-next-line no-unused-vars
    [key in "Coke" | "Pepsi" | "Water"]?: number;
  };
  cash?: Map<number, number>;
  loggedSupplier?: boolean;
}): VendingMachine => {
  let products;
  if (options?.products) {
    products = {
      ...(options?.products?.Coke !== undefined && options.products.Coke
        ? {
            Coke: {
              value: 1.5,
              quantity: options.products.Coke,
            },
          }
        : {}),
      ...(options?.products?.Pepsi !== undefined && options.products.Pepsi
        ? {
            Pepsi: {
              value: 1.45,
              quantity: options.products.Pepsi,
            },
          }
        : {}),
      ...(options?.products?.Water !== undefined && options.products.Water
        ? {
            Water: {
              value: 0.9,
              quantity: options.products.Water,
            },
          }
        : {}),
    };
  } else {
    products = {
      Coke: {
        value: 1.5,
        quantity: 3,
      },
      Pepsi: {
        value: 1.45,
        quantity: 3,
      },
      Water: {
        value: 0.9,
        quantity: 3,
      },
    };
  }

  const wallet = ACCEPTED_CASH.map((cash) => {
    if (options?.cash) {
      if (options.cash.has(cash)) {
        return {
          cash,
          amount: options.cash.get(cash),
        };
      }
      return;
    }
    return {
      cash,
      amount: 2,
    };
  }).filter((value) => value);

  const vendingMachine = new VendingMachine({
    products,
    acceptedCash: ACCEPTED_CASH,
    supplierKey: "Test123!",
    wallet,
  });

  if (options?.selected) {
    for (const product in options.selected) {
      ((vendingMachine as any).session as Session).products[product] =
        options.selected[product];
      ((vendingMachine as any).inventory as Inventory)[product].quantity -=
        options.selected[product];
      ((vendingMachine as any).session as Session).amount = FloatOperations.add(
        ((vendingMachine as any).session as Session).amount,
        FloatOperations.multiply(
          options.selected[product],
          products[product].value,
        ),
      );
    }
  }
  if (options?.payed) {
    for (const [cash, amount] of options.payed) {
      ((vendingMachine as any).session as Session).payment.cash.set(
        cash,
        amount,
      );
      ((vendingMachine as any).session as Session).payment.total =
        FloatOperations.add(
          ((vendingMachine as any).session as Session).payment.total,
          FloatOperations.multiply(cash, amount),
        );
    }
  }

  if (options?.loggedSupplier) {
    (vendingMachine as any).isSupplier = true;
  }

  return vendingMachine;
};
