import { ExpandedError } from "src/utils";
import { Inventory, Session } from "src/vending-machine/types";

import { initVendingMachine } from "../utils";

describe("Cancel", () => {
  describe("Success", () => {
    describe("Payment", () => {
      it("Should cancel successfully payment in progress", () => {
        // prepare
        const vendingMachine = initVendingMachine({
          selected: {
            Coke: 2,
          },
          payed: new Map<number, number>([[0.5, 1]]),
        });

        // action
        const session = vendingMachine.cancel("payment");

        const cashSessionChangeValidation = [
          [1, 0],
          [2, 0],
          [0.5, 1],
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
        expect(
          session.change.total,
          "There amount of change should be the one expected",
        ).toBe(0.5);

        const cashSessionPaymentValidation = [
          [1, 0],
          [2, 0],
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
        expect(session.payment.total, "There amount payed should be 0").toBe(0);
      });

      it("Should cancel successfully (do nothing) a session without a payment in progress", () => {
        // prepare
        const vendingMachine = initVendingMachine({
          selected: {
            Coke: 2,
          },
        });

        // action
        const session = vendingMachine.cancel("payment");
        const cashSessionChangeValidation = [
          [1, 0],
          [2, 0],
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
        expect(
          session.change.total,
          "There amount of change should be the one expected",
        ).toBe(0);

        const cashSessionPaymentValidation = [
          [1, 0],
          [2, 0],
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
        expect(session.payment.total, "There amount payed should be 0").toBe(0);
      });
    });

    describe("All", () => {
      it("Should cancel successfully payment in progress", () => {
        // prepare
        const vendingMachine = initVendingMachine({
          selected: {
            Coke: 2,
          },
          payed: new Map<number, number>([[0.5, 1]]),
        });

        // action
        const session: Session = vendingMachine.cancel();
        const inventory: Inventory = (vendingMachine as any)
          .inventory as Inventory;

        const cashSessionChangeValidation = [
          [1, 0],
          [2, 0],
          [0.5, 1],
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
        expect(
          session.change.total,
          "There amount of change should be the oe expected",
        ).toBe(0.5);

        const cashSessionPaymentValidation = [
          [1, 0],
          [2, 0],
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
        expect(session.payment.total, "There amount payed should be 0").toBe(0);

        expect(
          session.products.Coke,
          "Product should not exist in session",
        ).toBeUndefined();
        expect(session.amount, "Product amount to pay should be restored").toBe(
          0,
        );
        expect(
          inventory.Coke.quantity,
          "Coke quantity should be restored",
        ).toBe(3);
      });

      it("Should cancel successfully (do nothing) a session without a payment in progress", () => {
        // prepare
        const vendingMachine = initVendingMachine({
          selected: {
            Coke: 2,
          },
        });

        // action
        const session = vendingMachine.cancel("payment");

        const cashSessionChangeValidation = [
          [1, 0],
          [2, 0],
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
        expect(
          session.change.total,
          "There amount of change should be the oe expected",
        ).toBe(0);

        const cashSessionPaymentValidation = [
          [1, 0],
          [2, 0],
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
        expect(session.payment.total, "There amount payed should be 0").toBe(0);
      });
    });
  });

  describe("Fail", () => {
    it("Should Fail if supplier is logged in", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
        loggedSupplier: true,
      });

      // action
      const cancelAction = () => vendingMachine.cancel();

      expect(cancelAction).toThrow(ExpandedError);
    });
  });
});
