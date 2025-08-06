import { ExpandedError } from "src/utils";
import { VendingMachine } from "src/vending-machine/index";

import { initVendingMachine } from "../utils";

describe("Creation", () => {
  describe("Success", () => {
    it("Should be able to create a vending machine with only one product type and one cash type", () => {
      const vendingMachine = initVendingMachine({
        products: {
          Coke: 2,
          Pepsi: 0,
          Water: 0,
        },
        cash: new Map<number, number>([[1, 2]]),
      });

      const products = (vendingMachine as any).inventory;
      const wallet = (vendingMachine as any).wallet;

      expect(Object.keys(products).length).toBe(1);
      expect(products.Coke.quantity).toBe(2);
      expect(products.Coke.value).toBe(1.5);
      expect(products.Coke.value).toBe(1.5);
      expect(wallet.cash.get(1)).toBe(2);
      expect(wallet.total).toBe(2);
    });

    it("Should be able to create a vending machine with all products and all cash types", () => {
      const vendingMachine = initVendingMachine({
        products: {
          Coke: 2,
          Pepsi: 2,
          Water: 2,
        },
      });

      const products = (vendingMachine as any).inventory;
      const wallet = (vendingMachine as any).wallet;

      expect(Object.keys(products).length).toBe(3);
      expect(wallet.cash.size).toBe(6);
      expect(wallet.total).toBe(7.7);
    });
  });

  describe("Fail", () => {
    it("Should fail when product list not an object", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: "" as any,
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "Test123!",
          acceptedCash: [1],
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when product list is empty", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {},
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "Test123!",
          acceptedCash: [1],
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when cash is not supported", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 2.1,
              amount: 2,
            },
          ],
          acceptedCash: [2],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when quantity of product is not number", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: "Two" as any,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          acceptedCash: [1],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when quantity of product is 0 or less", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 0,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          acceptedCash: [1],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when value of product is not number", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: "two" as any,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          acceptedCash: [1],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when value of product is 0 or less", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 1,
              value: 0,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          acceptedCash: [1],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when value of cash is not number", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: "two" as any,
              amount: 2,
            },
          ],
          acceptedCash: [1],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when value of cash is 0 or less", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 0,
              amount: 2,
            },
          ],
          acceptedCash: [1],
          supplierKey: "Test123!",
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when supplier key is missing", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          acceptedCash: [1],
        } as any);

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when supplier key is empty", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "",
          acceptedCash: [1],
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when supplier key is less then 6 characters", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "123",
          acceptedCash: [1],
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when acceptedCash is missing", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "Test123!",
        } as any);

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when acceptedCash is not an array", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "Test123!",
          acceptedCash: "" as any,
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when acceptedCash is empty", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "Test123!",
          acceptedCash: [],
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });

    it("Should fail when acceptedCash has string value", () => {
      const vendingMachineCreation = () =>
        new VendingMachine({
          products: {
            Coke: {
              quantity: 2,
              value: 1.5,
            },
          },
          wallet: [
            {
              cash: 1,
              amount: 2,
            },
          ],
          supplierKey: "Test123!",
          acceptedCash: [12, "two" as any],
        });

      expect(vendingMachineCreation).toThrow(ExpandedError);
    });
  });
});
