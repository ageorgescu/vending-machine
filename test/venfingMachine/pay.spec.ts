import { ExpandedError } from "src/utils";
import { Inventory, InventoryWallet, Session } from "src/vending-machine/types";

import { initVendingMachine } from "../utils";

describe("Payment", () => {
  describe("Success", () => {
    it("Should pay successfully with one coin or bill.", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
      });

      // action
      const session = vendingMachine.pay(1);

      expect(
        session.payment.cash.size,
        "There should be only one type of coin/bill inserted",
      ).toBe(6);
      expect(
        session.payment.cash.get(1),
        "There should be only one coin/bill inserted",
      ).toBe(1);
      expect(session.payment.total, "There amount payed should be 1").toBe(1);
    });

    it("Should pay successfully two times", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
        payed: new Map<number, number>([[1, 1]]),
      });

      // action
      const session = vendingMachine.pay(0.5);

      expect(
        session.payment.cash.get(1),
        "There should be only one coin/bill inserted of one",
      ).toBe(1);
      expect(
        session.payment.cash.get(0.5),
        "There should be only one coin/bill inserted of fifty cents",
      ).toBe(1);
      expect(session.payment.total, "There amount payed should be 1.5").toBe(
        1.5,
      );

      const vendingMachineInventory: Inventory = (vendingMachine as any)
        .inventory;

      expect(
        vendingMachineInventory.Coke.quantity,
        "Product quantity should be the one expected",
      ).toBe(1);
    });

    it("Should pay successfully all products", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
        },
        payed: new Map<number, number>([[1, 1]]),
      });
      // action
      const result = vendingMachine.pay(2);

      expect(result.payment.total).toBe(0);
      expect(result.change.total, "There should no change").toBe(0);
      expect(result.amount, "There amount that was payed should be 3").toBe(3);

      const vendingMachineSession: Session = (vendingMachine as any).session;
      const vendingMachineWallet: InventoryWallet = (vendingMachine as any)
        .wallet as InventoryWallet;
      expect(
        vendingMachineSession.amount,
        "Reset session should have amount 0",
      ).toBe(0);
      expect(
        vendingMachineSession.payment.total,
        "Reset session should have payment 0",
      ).toBe(0);
      for (const cash of vendingMachineWallet.acceptedCash) {
        expect(
          vendingMachineSession.payment.cash.get(cash),
          `Reset session should not have payment coins/bills of ${cash}`,
        ).toBe(0);
      }

      expect(
        vendingMachineSession.change.total,
        "Reset session should not have change",
      ).toBe(0);

      const vendingMachineInventory: Inventory = (vendingMachine as any)
        .inventory;

      expect(
        vendingMachineInventory.Coke.quantity,
        "Product quantity should be the one expected",
      ).toBe(1);
    });

    it("Should pay successfully all products and give back change only from vending machine", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      // action
      const result = vendingMachine.pay(2);

      expect(result.payment.total).toBe(0);
      expect(result.change.total, "Change should be 0.5").toBe(0.5);

      expect(result.amount, "There amount that was payed should be 1.5").toBe(
        1.5,
      );

      const vendingMachineSession: Session = (vendingMachine as any).session;
      const vendingMachineWallet: InventoryWallet = (vendingMachine as any)
        .wallet;
      expect(
        vendingMachineSession.amount,
        "Reset session should have amount 0",
      ).toBe(0);
      expect(
        vendingMachineSession.payment.total,
        "Reset session should have payment 0",
      ).toBe(0);
      for (const cash of vendingMachineWallet.acceptedCash) {
        expect(
          vendingMachineSession.payment.cash.get(cash),
          `Reset session should not have payment coins/bills of ${cash}`,
        ).toBe(0);
      }

      expect(
        vendingMachineSession.change.total,
        "Reset session should not have change",
      ).toBe(0);
    });

    it("Should pay successfully all products and give back change from vending machine and payment session", () => {
      // prepare
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 2,
          Pepsi: 1,
          Water: 1,
        },
        cash: new Map<number, number>([
          [1, 2],
          [2, 2],
          [0.2, 1],
        ]),
        payed: new Map<number, number>([
          [2, 1],
          [1, 1],
          [0.1, 18],
          [0.2, 1],
          [0.05, 2],
        ]),
      });

      // action
      const result = vendingMachine.pay(2);

      expect(result.payment.total).toBe(0);
      expect(result.change.total, "Change should be the one expected").toBe(
        1.75,
      );
      expect(result.amount, "There amount that was payed should be 5.35").toBe(
        5.35,
      );

      const vendingMachineWallet: InventoryWallet = (vendingMachine as any)
        .wallet;
      expect(
        vendingMachineWallet.total,
        "Vending Machine wallet should have the necessary amount",
      ).toBe(11.55);

      const cashValidation = [
        [2, 4],
        [1, 2],
        [0.5, 0],
        [0.2, 0],
        [0.1, 15],
        [0.05, 1],
      ];
      for (const [cash, quantity] of cashValidation) {
        expect(
          vendingMachineWallet.cash.get(cash),
          `Vending Machine wallet should have have the necessary amount of ${cash}`,
        ).toBe(quantity);
      }

      const vendingMachineSession: Session = (vendingMachine as any).session;
      expect(
        vendingMachineSession.amount,
        "Reset session should have amount 0",
      ).toBe(0);
      expect(
        vendingMachineSession.payment.total,
        "Reset session should have payment 0",
      ).toBe(0);
      for (const cash of vendingMachineWallet.acceptedCash) {
        expect(
          vendingMachineSession.payment.cash.get(cash),
          `Reset session should not have payment coins/bills of ${cash}`,
        ).toBe(0);
      }

      expect(
        vendingMachineSession.change.total,
        "Reset session should not have change",
      ).toBe(0);
    });
  });

  describe("Fail", () => {
    it("Should fail when paying with an unsupported coins/bills", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      const vendingMachinePayment = () => vendingMachine.pay("five" as any);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when paying this no coins/bills", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
      });

      const vendingMachinePayment = () => vendingMachine.pay(0.05, 0);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when paying while supplier is logged on", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
        loggedSupplier: true,
      });
      (vendingMachine as any).isSupplier = true;

      const vendingMachinePayment = () => vendingMachine.pay(0.05, 1);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should fail when it does not have enough change to give back", () => {
      const vendingMachine = initVendingMachine({
        selected: {
          Coke: 1,
        },
        cash: new Map<number, number>([[2, 2]]),
      });

      const vendingMachinePayment = () => vendingMachine.pay(2);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });

    it("Should not be able to pay when no product is selected", () => {
      // prepare
      const vendingMachine = initVendingMachine();

      // action
      const vendingMachinePayment = () => vendingMachine.pay(2);

      expect(vendingMachinePayment).toThrow(ExpandedError);
    });
  });
});
