import { ExpandedError } from "src/utils";
import { Inventory, Session } from "src/vending-machine/types";

import { initVendingMachine } from "../utils";

describe("Selection", () => {
  describe("Success", () => {
    it("Should select successfully 2 products, when the products exists and has necessary quantity", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      const session: Session = vendingMachine.select("Coke", 2);

      const products = (vendingMachine as any).inventory as Inventory;

      expect(
        Object.keys(session.products as any).length,
        "Product types selected should be 1",
      ).toBe(1);
      expect(session.products.Coke, "Coke products selected should be 2").toBe(
        2,
      );
      expect(
        products.Coke.quantity,
        "Coke inventory quantity should have 1 more",
      ).toBe(1);
    });

    it("Should select successfully the same product already selected", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
      });
      // action
      let session: Session = vendingMachine.select("Coke", 1);

      expect(session.products.Coke, "Coke products selected should be 3").toBe(
        3,
      );
    });

    it("Should select successfully multiple products and quantities", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
      });

      // action
      const session: Session = vendingMachine.select("Pepsi", 1);

      expect(
        Object.keys(session.products).length,
        "There should be 2 types of products selected",
      ).toBe(2);
      expect(session.products.Coke, "Coke products selected should be 2").toBe(
        2,
      );
      expect(
        session.products.Pepsi,
        "Pepsi products selected should be 1",
      ).toBe(1);
    });
  });

  describe("Fail", () => {
    it("Should fail when selecting a product that does not exist", () => {
      const vendingMachine = initVendingMachine();

      const vendingMachineSelection = () => vendingMachine.select("Fanta");

      expect(vendingMachineSelection).toThrow(ExpandedError);
    });

    it("Should fail selecting a product that does not have enough quantity", () => {
      const vendingMachine = initVendingMachine();

      const vendingMachineSelection = () => vendingMachine.select("Coke", 4);

      expect(vendingMachineSelection).toThrow(ExpandedError);
    });

    it("Should fail selecting a product with 0 quantity", () => {
      const vendingMachine = initVendingMachine();

      const vendingMachineSelection = () => vendingMachine.select("Coke", 0);

      expect(vendingMachineSelection).toThrow(ExpandedError);
    });

    it("Should fail selecting a product when payment is in progress", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
        payed: new Map<number, number>([[1, 1]]),
      });

      const vendingMachineSelection = () => vendingMachine.select("Coke", 1);

      expect(vendingMachineSelection).toThrow(ExpandedError);
    });

    it("Should fail selecting product while the supplier is logged on", () => {
      const vendingMachine = initVendingMachine({
        loggedSupplier: true,
      });

      const vendingMachineSelection = () => vendingMachine.select("Coke", 1);

      expect(vendingMachineSelection).toThrow(ExpandedError);
    });
  });
});
