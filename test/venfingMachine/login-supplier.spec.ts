import { ExpandedError } from "src/utils";

import { initVendingMachine } from "../utils";

describe("Login Supplier", () => {
  describe("Success", () => {
    it("Should login successfully as supplier", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      vendingMachine.loginSupplier("Test123!");

      const vendingMachineSupplierOption: boolean = (vendingMachine as any)
        .isSupplier;
      expect(
        vendingMachineSupplierOption,
        "Vending Machine supplier should be logged on",
      ).toBe(true);
    });

    it("Should login successfully even if the supplier is already logged in and key given is different (ignore action)", () => {
      // prepare
      const vendingMachine = initVendingMachine({ loggedSupplier: true });

      // action
      vendingMachine.loginSupplier("T123");

      const vendingMachineSupplierOption: boolean = (vendingMachine as any)
        .isSupplier;
      expect(
        vendingMachineSupplierOption,
        "Vending Machine supplier should be logged on",
      ).toBe(true);
    });
  });

  describe("Fail", () => {
    it("Should fail to login as supplier if key is wrong", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      const restoreAction = () => vendingMachine.loginSupplier("Test");

      expect(restoreAction).toThrow(ExpandedError);
    });

    it("Should fail to login as supplier if transaction is in progress", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      // action
      const restoreAction = () => vendingMachine.loginSupplier("Test123!");

      expect(restoreAction).toThrow(ExpandedError);
    });
  });
});
