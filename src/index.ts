import { ConsoleUserInterface } from "./console-user-interface";
import { VendingMachine } from "./vending-machine";

const acceptedCash = [2, 1, 0.5, 0.2, 0.1, 0.05];

const vendingMachine: VendingMachine = new VendingMachine({
  products: {
    Coke: {
      quantity: 10,
      value: 1.5,
    },
    Pepsi: {
      quantity: 10,
      value: 1.45,
    },
    Water: {
      quantity: 10,
      value: 0.9,
    },
  },
  wallet: acceptedCash.map((cash) => ({ cash, amount: 10 })),
  acceptedCash,
  supplierKey: "Test123!",
});

const consoleUserInterface: ConsoleUserInterface = new ConsoleUserInterface(
  vendingMachine,
);

consoleUserInterface.run();
