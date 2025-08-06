export type Product = {
  quantity: number;
  value: number;
};

export type Wallet = {
  cash: Map<number, number>;
  total: number;
};

export type InventoryWallet = Wallet & {
  acceptedCash: number[];
};

export type Inventory = {
  [key: string]: Product;
};

export type InitialInventory = {
  products: Inventory;
  wallet: InventoryWallet;
};

export type Session = {
  products: {
    [key: string]: number;
  };
  payment: Wallet;
  change: Wallet;
  payed: boolean;
  amount: number;
};
