import { initVendingMachine } from "../utils";

describe("End2End Flow", () => {
  it("Select one product and pay with exact cash. Return products and amount payed.", () => {
    // prepare
    const vendingMachine = initVendingMachine();
    vendingMachine.select("Coke", 1);
    vendingMachine.pay(1);

    // action
    const session = vendingMachine.pay(0.5);

    const cashSessionChangeValidation = [
      [2, 0],
      [1, 0],
      [0.5, 0],
      [0.2, 0],
      [0.1, 0],
      [0.05, 0],
    ];
    for (const [cash, quantity] of cashSessionChangeValidation) {
      expect(
        session.change.cash.get(cash),
        `Session change should have have the necessary amount of ${cash}`,
      ).toBe(quantity);
    }
    expect(session.change.total, "There should be no change").toBe(0);
    expect(
      session.amount,
      "There amount payed should be the one expected",
    ).toBe(1.5);
    expect(
      session.payment.total,
      "There should be no payment in progress",
    ).toBe(0);

    expect(session.products.Coke, "There should exactly 1 product payed").toBe(
      1,
    );
  });

  it("Select two products and pay. Return products, amount payed and change.", () => {
    // prepare
    const vendingMachine = initVendingMachine();

    vendingMachine.select("Coke", 1);
    vendingMachine.select("Pepsi", 1);
    vendingMachine.pay(2);

    // action
    const session = vendingMachine.pay(2);

    const cashSessionChangeValidation = [
      [2, 0],
      [1, 1],
      [0.5, 0],
      [0.2, 0],
      [0.1, 0],
      [0.05, 1],
    ];
    for (const [cash, quantity] of cashSessionChangeValidation) {
      expect(
        session.change.cash.get(cash),
        `Session change should have have the necessary amount of ${cash}`,
      ).toBe(quantity);
    }
    expect(session.change.total, "There should be change").toBe(1.05);
    expect(
      session.amount,
      "There amount payed should be the one expected",
    ).toBe(2.95);
    expect(
      session.payment.total,
      "There should be no payment in progress",
    ).toBe(0);

    expect(session.products.Coke, "There should exactly 1 Coke payed").toBe(1);
    expect(session.products.Pepsi, "There should exactly 1 Pepsi payed").toBe(
      1,
    );
  });

  it("Select same product and pay with over payment", () => {
    // prepare
    const vendingMachine = initVendingMachine();

    vendingMachine.select("Water", 1);
    vendingMachine.select("Water", 1);
    vendingMachine.pay(1);
    vendingMachine.pay(0.5);
    vendingMachine.pay(0.2);

    // action
    const session = vendingMachine.pay(0.2);

    const cashSessionChangeValidation = [
      [2, 0],
      [1, 0],
      [0.5, 0],
      [0.2, 0],
      [0.1, 1],
      [0.05, 0],
    ];
    for (const [cash, quantity] of cashSessionChangeValidation) {
      expect(
        session.change.cash.get(cash),
        `Session change should have have the necessary amount of ${cash}`,
      ).toBe(quantity);
    }
    expect(session.change.total, "There should be change").toBe(0.1);
    expect(
      session.amount,
      "There amount payed should be the one expected",
    ).toBe(1.8);
    expect(
      session.payment.total,
      "There should be no payment in progress",
    ).toBe(0);

    expect(session.products.Water, "There should exactly 2 Water payed").toBe(
      2,
    );
  });

  it("Select same product, remove all products one by one", () => {
    // prepare
    const vendingMachine = initVendingMachine();

    vendingMachine.select("Water", 1);
    vendingMachine.select("Water", 1);
    vendingMachine.remove("Water");

    // action
    const session = vendingMachine.remove("Water");

    const cashSessionPaymentValidation = [
      [2, 0],
      [1, 0],
      [0.5, 0],
      [0.2, 0],
      [0.1, 0],
      [0.05, 0],
    ];
    for (const [cash, quantity] of cashSessionPaymentValidation) {
      expect(
        session.payment.cash.get(cash),
        `Session payment should have have the necessary amount of ${cash}`,
      ).toBe(quantity);
    }
    expect(session.payment.total, "There should be no payment amount").toBe(0);
    expect(
      session.amount,
      "There amount payed should be the one expected",
    ).toBe(0);

    expect(session.change.total, "There should be no change").toBe(0);

    expect(
      Object.keys(session.products).length,
      "There should be no product selected",
    ).toBe(0);
  });

  it("Select same product, pay and cancel everything", () => {
    // prepare
    const vendingMachine = initVendingMachine();

    vendingMachine.select("Water", 1);
    vendingMachine.select("Water", 1);
    vendingMachine.pay(1);
    vendingMachine.pay(0.5);
    vendingMachine.pay(0.2);

    // action
    const session = vendingMachine.cancel();

    const cashSessionChangeValidation = [
      [2, 0],
      [1, 1],
      [0.5, 1],
      [0.2, 1],
      [0.1, 0],
      [0.05, 0],
    ];
    for (const [cash, quantity] of cashSessionChangeValidation) {
      expect(
        session.change.cash.get(cash),
        `Session change should have have the necessary amount of ${cash}`,
      ).toBe(quantity);
    }
    expect(session.change.total, "There should be change").toBe(1.7);
    expect(
      session.amount,
      "There amount payed should be the one expected",
    ).toBe(0);

    const cashSessionPaymentValidation = [
      [2, 0],
      [1, 0],
      [0.5, 0],
      [0.2, 0],
      [0.1, 0],
      [0.05, 0],
    ];
    for (const [cash, quantity] of cashSessionPaymentValidation) {
      expect(
        session.payment.cash.get(cash),
        `Session payment should have have the necessary amount of ${cash}`,
      ).toBe(quantity);
    }
    expect(session.payment.total, "There should be change").toBe(0);

    expect(
      Object.keys(session.products).length,
      "There should be no product selected",
    ).toBe(0);
  });
});
