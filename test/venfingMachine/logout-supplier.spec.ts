import { initVendingMachine } from "../utils";

describe("Logout Supplier", () => {
  describe("Success", () => {
    it("Should logout successfully as supplier", () => {
      // prepare
      const vendingMachine = initVendingMachine({ loggedSupplier: true });

      // action
      vendingMachine.logoutSupplier();

      const vendingMachineSupplierOption: boolean = (vendingMachine as any)
        .isSupplier;
      expect(
        vendingMachineSupplierOption,
        "Vending Machine supplier should be logged out",
      ).toBe(false);
    });

    it("Should logout successfully even when supplier is already logged out (ignore action)", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      vendingMachine.logoutSupplier();

      const vendingMachineSupplierOption: boolean = (vendingMachine as any)
        .isSupplier;
      expect(
        vendingMachineSupplierOption,
        "Vending Machine supplier should be logged out",
      ).toBe(false);
    });
  });
});
