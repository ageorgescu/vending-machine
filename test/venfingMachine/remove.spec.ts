import { ExpandedError } from "src/utils";
import { Inventory } from "src/vending-machine/types";

import { initVendingMachine } from "../utils";

describe("Removal", () => {
  describe("Success", () => {
    it("Should remove successfully one quantity for one product, where there is one selected product of multiple quantity", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
      });

      // action
      const session = vendingMachine.remove("Coke");
      const inventory = (vendingMachine as any).inventory as Inventory;

      expect(session.products.Coke, "There should be 1 Coke in session").toBe(
        1,
      );
      expect(session.amount, "The amount to pay should be for one coke").toBe(
        1.5,
      );
      expect(
        inventory.Coke.quantity,
        "There should be same amount of coke in inventory",
      ).toBe(2);
    });

    it("Should remove successfully multiple quantity for one product, where there is one selected product of multiple quantity", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
      });

      // action
      const session = vendingMachine.remove("Coke", 3);
      const inventory = (vendingMachine as any).inventory as Inventory;

      expect(
        session.products.Coke,
        "There should be no Coke in session",
      ).toBeUndefined();
      expect(session.amount, "The amount to pay should be erased").toBe(0);
      expect(
        inventory.Coke.quantity,
        "The quantity in inventory should be restored",
      ).toBe(3);
    });

    it("Should remove successfully exact quantity for one product, where there is one selected product of multiple quantity", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
      });

      // action
      const session = vendingMachine.remove("Coke", 2);
      const inventory = (vendingMachine as any).inventory as Inventory;

      expect(
        session.products.Coke,
        "There should be no Coke in session",
      ).toBeUndefined();
      expect(session.amount, "The amount to pay should be erased").toBe(0);
      expect(
        inventory.Coke.quantity,
        "The quantity in inventory should be restored",
      ).toBe(3);
    });

    it("Should remove successfully less quantity for one product, where there are more selected products of multiple quantity", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        products: {
          Coke: 3,
          Pepsi: 3,
        },
        selected: {
          Coke: 2,
          Pepsi: 3,
        },
      });

      // action
      const session = vendingMachine.remove("Coke", 2);
      const inventory = (vendingMachine as any).inventory as Inventory;

      expect(
        session.products.Coke,
        "There should be no Coke in session",
      ).toBeUndefined();
      expect(session.amount, "The amount to pay should be less").toBe(4.35);
      expect(
        session.products.Pepsi,
        "There should be pepsi remaining in session",
      ).toBe(3);
      expect(
        inventory.Pepsi.quantity,
        "There should no pepsi remaining in inventory",
      ).toBe(0);
    });
  });

  describe("Fail", () => {
    it("Should fail when trying to remove an unregistered product", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      const vendingMachinePayment = () => vendingMachine.remove("fanta");

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when trying to remove when payment is in process", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
        payed: new Map<number, number>([[1, 1]]),
      });
      const vendingMachinePayment = () => vendingMachine.remove("Coke");

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when trying to remove with negative quantity", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      const vendingMachinePayment = () => vendingMachine.remove("Coke", -1);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when trying to remove with zero quantity", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      const vendingMachinePayment = () => vendingMachine.remove("Coke", 0);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when trying to remove while supplier is logged on", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
        loggedSupplier: true,
      });

      const vendingMachinePayment = () => vendingMachine.remove("Coke", 1);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });
  });
});
