import { ExpandedError } from "src/utils";
import { Inventory, Wallet } from "src/vending-machine/types";

import { initVendingMachine } from "../utils";

describe("Restore", () => {
  describe("Success", () => {
    it("Should restore successfully the full inventory and wallet", () => {
      // prepare
      const vendingMachine = initVendingMachine({ loggedSupplier: true });

      ((vendingMachine as any).inventory as Inventory).Coke.quantity = 1;
      ((vendingMachine as any).wallet as Wallet) = {
        total: 0,
        cash: new Map<number, number>(
          (vendingMachine as any).wallet.acceptedCash.map((cash) => [cash, 0]),
        ),
      };

      // action
      vendingMachine.restore();

      const vendingMachineWallet: Wallet = (vendingMachine as any).wallet;
      expect(
        vendingMachineWallet.total,
        "Vending Machine wallet should have amount wanted",
      ).toBe(7.7);

      const cashValidation = [
        [1, 2],
        [2, 2],
        [0.5, 2],
        [0.2, 2],
        [0.1, 2],
        [0.05, 2],
      ];
      for (const [cash, quantity] of cashValidation) {
        expect(
          vendingMachineWallet.cash.get(cash),
          `Vending Machine wallet should have have the necessary amount of ${cash}`,
        ).toBe(quantity);
      }

      const vendingMachineInventory: Inventory = (vendingMachine as any)
        .inventory;

      expect(
        vendingMachineInventory.Coke.quantity,
        "Product quantity should be restored",
      ).toBe(3);
    });
  });

  describe("Fail", () => {
    it("Should fail to restore if the current user is not supplier", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      const restoreAction = () => vendingMachine.restore();

      expect(restoreAction).toThrow(ExpandedError);
    });
  });
});
