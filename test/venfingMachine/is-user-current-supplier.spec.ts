import { initVendingMachine } from "../utils";

describe("Is Current User Supplier", () => {
  describe("Success", () => {
    it("Current user should be user", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      const isSupplier = vendingMachine.isCurrentUserSupplier();

      expect(isSupplier, "Vending Machine supplier should be logged off").toBe(
        false,
      );
    });

    it("Current user should be supplier", () => {
      // prepare
      const vendingMachine = initVendingMachine({ loggedSupplier: true });

      // action
      const isSupplier = vendingMachine.isCurrentUserSupplier();

      expect(isSupplier, "Vending Machine supplier should be logged off").toBe(
        true,
      );
    });
  });
});
