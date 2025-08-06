import { Product } from "./types";

export interface VendingMachineInit {
  products: {
    [key: string]: Product;
  };
  wallet: { cash: number; amount: number }[];
  acceptedCash: number[];
  supplierKey: string;
}
