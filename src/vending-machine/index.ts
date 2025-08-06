import {
  EncryptMachine,
  ExpandedError,
  FloatOperations,
  Validator,
} from "src/utils";

import { PRODUCT_INPUT_VALIDATIONS, CASH_INPUT_VALIDATIONS } from "./constants";
import { VendingMachineInit } from "./interfaces";
import {
  InitialInventory,
  Inventory,
  InventoryWallet,
  Product,
  Session,
  Wallet,
} from "./types";

/**
 * Vending Machine
 */
export class VendingMachine {
  /**
   * Inventory of the vending machine
   */
  private inventory: Inventory;

  /**
   * Wallet of the vending machine, containing all the cash and total amount
   */
  private wallet: InventoryWallet;

  /**
   * Contains the initial inventory and wallet at creation
   */
  private initialInventory: InitialInventory;

  /**
   * Cache to register user selected products.
   */
  private session: Session;

  /**
   * Supplier Login
   */
  private isSupplier: boolean;

  /**
   * Supplier key
   */
  private supplierKey: string;

  /**
   * Build vending machine with initial products and wallet
   */
  constructor(options: VendingMachineInit) {
    this.validate(options);
    this.initialize(options);
    this.restoreSession();
  }

  /**
   * Initializes the vending machine with needed info to work properly
   */
  private initialize(options: VendingMachineInit): void {
    const { products, wallet, supplierKey, acceptedCash } = options;

    acceptedCash.sort((a, b) => b - a);

    const inventoryTemp: Inventory = {};
    const initialInventoryTemp: InitialInventory = {
      products: {},
      wallet: {
        acceptedCash,
        cash: new Map<number, number>(),
        total: 0,
      },
    };
    const walletTemp: InventoryWallet = {
      acceptedCash,
      cash: new Map<number, number>(),
      total: 0,
    };

    for (const name in products) {
      const { quantity, value } = products[name];
      inventoryTemp[name] = {
        quantity,
        value,
      };
      initialInventoryTemp.products[name] = {
        quantity,
        value,
      };
    }

    this.inventory = inventoryTemp as Inventory;
    this.initialInventory = initialInventoryTemp as InitialInventory;

    for (const { cash, amount: quantity } of wallet) {
      walletTemp.total = FloatOperations.add(
        walletTemp.total,
        FloatOperations.multiply(cash, quantity),
      );
      walletTemp.cash.set(cash, quantity);
      this.initialInventory.wallet.cash.set(cash, quantity);
    }

    for (const cash of walletTemp.acceptedCash) {
      if (!walletTemp.cash.has(cash)) {
        walletTemp.cash.set(cash, 0);
        this.initialInventory.wallet.cash.set(cash, 0);
      }
    }

    this.initialInventory.wallet.total = walletTemp.total;
    this.wallet = walletTemp;

    this.isSupplier = false;
    this.supplierKey = EncryptMachine.encrypt(supplierKey);
  }

  /**
   * Restores session to initial state
   */
  private restoreSession(): void {
    this.session = {
      products: {},
      amount: 0,
      payment: {
        cash: new Map<number, number>(
          this.wallet.acceptedCash.map((cash) => [cash, 0]),
        ),
        total: 0,
      },
      payed: false,
      change: {
        cash: new Map<number, number>(
          this.wallet.acceptedCash.map((cash) => [cash, 0]),
        ),
        total: 0,
      },
    };
  }

  /**
   * Validates the input for vending machine creation
   */
  private validate(options: VendingMachineInit): void {
    try {
      const { products, wallet, supplierKey, acceptedCash } = options;
      if ({}.constructor !== products.constructor) {
        throw new ExpandedError({
          message: "Expected an object of items to sell",
        });
      }

      if ([].constructor !== acceptedCash.constructor) {
        throw new ExpandedError({
          message: "Expected an array of items for coins/bills",
        });
      }

      for (const moneyIndex in acceptedCash) {
        const money = acceptedCash[moneyIndex];
        if (isNaN(money)) {
          throw new ExpandedError({
            message: "Failed to add product",
            metadata: {
              property: `items[${moneyIndex}]`,
              error: "Money value should be a number",
            },
          });
        }
      }

      if (Object.keys(products).length === 0) {
        throw new ExpandedError({
          message: "Expected products to sell",
        });
      }

      for (const productName in products) {
        const productInfo = products[productName];
        // Validate items properties
        const productIssues = Validator.validate({
          object: productInfo,
          validations: PRODUCT_INPUT_VALIDATIONS,
        });
        if (productIssues) {
          throw new ExpandedError({
            message: "Failed to add product",
            metadata: {
              property: `items[${productInfo}]`,
              issues: productIssues,
            },
          });
        }
      }

      for (const cashIndex in wallet) {
        const cashConfig = wallet[cashIndex];
        // Validate items properties
        const productIssues = Validator.validate({
          object: cashConfig,
          validations: CASH_INPUT_VALIDATIONS(acceptedCash),
        });
        if (productIssues) {
          throw new ExpandedError({
            message: "Failed to add cash to wallet",
            metadata: {
              property: `items[${cashIndex}]`,
              issues: productIssues,
            },
          });
        }
      }

      if (
        !supplierKey ||
        supplierKey.constructor !== "".constructor ||
        supplierKey.trim().length < 6
      ) {
        throw new ExpandedError({
          message: "Failed to add supplier key",
          metadata: {
            property: "supplierKey",
            issue: "Supplier key should be a string of min 6 characters",
          },
        });
      }
    } catch (error) {
      throw new ExpandedError({
        message: "Failed to create vending machine",
        cause: error,
      });
    }
  }

  /**
   * Removes products from session
   */
  private removeProduct(product: string, quantity: number) {
    const productInfo: Product = this.inventory[product];
    const availableQuantity: number = this.session?.products?.[product];
    const removalQuantity: number =
      availableQuantity < quantity ? availableQuantity : quantity;

    this.session.products[product] -= removalQuantity;
    if (this.session.products[product] === 0) {
      delete this.session.products[product];
    }

    this.session.amount = FloatOperations.subtract(
      this.session.amount,
      FloatOperations.multiply(removalQuantity, productInfo.value),
    );

    this.inventory[product].quantity += removalQuantity;
  }

  /**
   * Cancel payment
   */
  private cancelPayment(): void {
    if (this.session.payment.total === 0) {
      return;
    }

    this.session.change = this.session.payment;
    this.session.payment = {
      cash: new Map<number, number>(
        this.wallet.acceptedCash.map((cash) => [cash, 0]),
      ),
      total: 0,
    };
  }

  /**
   * Cancel products
   */
  private cancelProducts(): void {
    for (const product in this.session.products) {
      const quantity = this.session.products[product];
      this.removeProduct(product, quantity);
    }
  }

  /**
   * Get Inventory info
   */
  private inventoryInfo(): string {
    const base = "  ";
    let result = "Inventory:";
    result += `\n${base}Products:`;
    for (const product in this.inventory) {
      const { quantity, value } = this.inventory[product];
      if (quantity > 0) {
        result += `\n${base.repeat(2)}${product}(${quantity}) (cost: ${value})`;
      }
    }

    if (this.isSupplier) {
      result += `\n${base}Wallet:  ${this.wallet.total}`;
      for (const [cash, quantity] of this.wallet.cash) {
        if (quantity > 0) {
          result += `\n${base.repeat(2)}${cash}(${quantity})`;
        }
      }
    }

    return result;
  }

  /**
   * Get info string session
   */
  private sessionInfo(session: Session): string {
    if (this.isSupplier) {
      return "";
    }
    let result = "Current Session: ";
    if (session.amount === 0) {
      result += "N/A";
    } else {
      const base = "  ";
      result += `\n${base}Cost:         ${session.amount}`;
      if (!session.payed) {
        const leftToPay = FloatOperations.subtract(
          session.amount,
          session.payment.total,
        );
        result += `\n${base}Left tot pay: ${leftToPay}`;
      }
      result += `\n${base}Products: `;
      for (const product in session.products) {
        const quantity = session.products[product];
        result += `\n${base.repeat(2)}${product}(${quantity})`;
      }
      if (session.payment.total > 0) {
        result += `\n${base}Payed: ${session.payment.total}`;
        for (const [cash, quantity] of session.payment.cash) {
          if (quantity > 0) {
            result += `\n${base.repeat(2)}${cash}(${quantity})`;
          }
        }
      }
      if (session.change.total > 0) {
        result += `\n${base}Change: ${session.change.total}`;
        for (const [cash, quantity] of session.change.cash) {
          if (quantity > 0) {
            result += `\n${base.repeat(2)}${cash}(${quantity})`;
          }
        }
      }
    }
    return result;
  }

  /**
   * Get reset string
   */
  private resetInfo(): string {
    if (!this.isSupplier) {
      return "";
    }

    let needsUpdates = false;

    const base = "  ";
    let result = "Updates: ";
    result += `\n${base}Products: `;
    for (const product in this.initialInventory.products) {
      const delta =
        this.initialInventory.products[product].quantity -
        this.inventory[product].quantity;
      if (delta > 0) {
        result += `\n${base.repeat(2)}${product} (${delta})`;
        needsUpdates = true;
      }
    }

    if (!needsUpdates) {
      return "No updates needed";
    }

    let addSum = 0;
    let removeSum = 0;
    let addUpdates = [];
    let removeUpdates = [];
    for (const [cash, quantity] of this.wallet.cash) {
      const delta = this.initialInventory.wallet.cash.get(cash) - quantity;
      const cashItems = Math.abs(delta);
      const amount = FloatOperations.multiply(Math.abs(delta), cash);
      if (delta > 0) {
        addSum = FloatOperations.add(addSum, amount);
        addUpdates.push(`\n${base.repeat(3)}${cash} (${cashItems})`);
      } else if (delta < 0) {
        removeSum = FloatOperations.add(removeSum, amount);
        removeUpdates.push(`\n${base.repeat(3)}${cash} (${cashItems})`);
      }
    }

    result += `\n${base}Wallet: `;
    if (addUpdates.length) {
      result += `\n${base.repeat(2)}Add: (${addSum})`;
      result += addUpdates.join("");
    }
    if (removeUpdates.length) {
      result += `\n${base.repeat(2)}Remove: (${removeSum})`;
      result += removeUpdates.join("");
    }

    return result;
  }

  /**
   * Selects product
   */
  public select(product: string, quantity: number = 1): Session {
    if (this.isSupplier) {
      throw new ExpandedError({
        message: "Only client can select products",
      });
    }
    const productInfo: Product = this.inventory[product];

    // Check for product availability
    if (!productInfo) {
      throw new ExpandedError({
        message: "The product is not found",
      });
    }

    // Check if payment has started
    if (this.session.payment?.total > 0) {
      throw new ExpandedError({
        message:
          "Payment process has already started. Cancel payment to select another product",
      });
    }

    if (quantity <= 0) {
      throw new ExpandedError({
        message: "Selection can be made with at least one product",
      });
    }

    const availableQuantity: number = productInfo.quantity - quantity;

    if (availableQuantity < 0) {
      throw new ExpandedError({
        message:
          "The selected product is not available for the selected quantity",
        metadata: {
          quantity,
        },
      });
    }

    if (this.session.products[product] === undefined) {
      this.session.products[product] = 0;
    }

    this.session.products[product] += quantity;
    this.session.amount = FloatOperations.add(
      this.session.amount,
      FloatOperations.multiply(quantity, productInfo.value),
    );

    this.inventory[product].quantity -= quantity;

    return structuredClone(this.session);
  }

  /**
   * Removes product
   */
  public remove(product: string, quantity: number = 1): Session {
    if (this.isSupplier) {
      throw new ExpandedError({
        message: "Only client can remove products",
      });
    }
    const productInfo: Product = this.inventory[product];

    // Check for product availability
    if (!productInfo) {
      throw new ExpandedError({
        message: "The product is not found",
      });
    }

    // Check if payment has started
    if (this.session.payment?.total > 0) {
      throw new ExpandedError({
        message:
          "Payment process has already started. Cancel payment to remove all/some of the products",
      });
    }

    if (quantity <= 0) {
      throw new ExpandedError({
        message: "Removal can be made with at least one product",
      });
    }

    this.removeProduct(product, quantity);

    return structuredClone(this.session);
  }

  /**
   *  Starts, continues or finishes the payment process
   */
  public pay(cash: number, quantity: number = 1): Session {
    if (this.isSupplier) {
      throw new ExpandedError({
        message: "Only client can remove products",
      });
    }

    if (!Object.values(this.wallet.acceptedCash).includes(cash)) {
      throw new ExpandedError({
        message: `Cash not supported. Use ${this.wallet.acceptedCash.join(",")}`,
      });
    }

    if (quantity <= 0) {
      throw new ExpandedError({
        message: "Need at least one to pay",
      });
    }

    if (this.session.amount === 0) {
      throw new ExpandedError({
        message: "Select at least one product before paying",
      });
    }

    this.session.payment.cash.set(
      cash,
      this.session.payment.cash.get(cash) + quantity,
    );
    this.session.payment.total = FloatOperations.add(
      FloatOperations.multiply(cash, quantity),
      this.session.payment.total,
    );

    const isPayed = this.session.payment.total >= this.session.amount;
    if (!isPayed) {
      return structuredClone(this.session);
    }

    // here decide if it has the necessary change to give back
    const change: Wallet = {
      cash: new Map<number, number>(
        this.wallet.acceptedCash.map((cash) => [cash, 0]),
      ),
      total: 0,
    };

    let changeAmount = FloatOperations.subtract(
      this.session.payment.total,
      this.session.amount,
    );
    const needsChange = changeAmount > 0;
    if (needsChange) {
      change.total = changeAmount;
      for (const [cash] of change.cash) {
        const availableCashItems =
          this.wallet.cash.get(cash) + this.session.payment.cash.get(cash);

        if (availableCashItems <= 0 || cash > changeAmount) {
          continue;
        }

        const numberOfCashItemsNeeded = Math.floor(changeAmount / cash);
        change.cash.set(
          cash,
          numberOfCashItemsNeeded > availableCashItems
            ? availableCashItems
            : numberOfCashItemsNeeded,
        );
        changeAmount = FloatOperations.subtract(
          changeAmount,
          FloatOperations.multiply(change.cash.get(cash), cash),
        );
        if (changeAmount === 0) {
          break;
        }
      }

      if (changeAmount > 0) {
        this.session.payment.cash.set(
          cash,
          this.session.payment.cash.get(cash) - quantity,
        );
        this.session.payment.total = FloatOperations.subtract(
          this.session.payment.total,
          FloatOperations.multiply(cash, quantity),
        );
        throw new ExpandedError({
          message:
            "Do not have necessary change to give back. Use another cash value",
        });
      } else {
        // Update wallet
        for (const [cash, quantity] of change.cash) {
          this.wallet.cash.set(cash, this.wallet.cash.get(cash) - quantity);
          this.wallet.total = FloatOperations.subtract(
            this.wallet.total,
            FloatOperations.multiply(cash, quantity),
          );
        }

        this.session.change = change;
      }
    }

    // Update wallet
    for (const [cash, quantity] of this.session.payment.cash) {
      this.wallet.cash.set(cash, this.wallet.cash.get(cash) + quantity);
      this.wallet.total = FloatOperations.add(
        this.wallet.total,
        FloatOperations.multiply(quantity, cash),
      );
    }

    const response = this.session;

    // restore session
    this.restoreSession();
    response.payment = structuredClone(this.session.payment);
    response.payed = true;

    return response;
  }

  /**
   * Cancel current transaction
   *  - all action -> cancels payment and products
   *  - payment -> cancels payment
   */
  public cancel(action: "all" | "payment" = "all"): Session {
    if (this.isSupplier) {
      throw new ExpandedError({
        message: "Only client can remove products",
      });
    }
    switch (action) {
      case "all":
        this.cancelPayment();
        this.cancelProducts();
        break;
      case "payment":
        this.cancelPayment();
        break;
    }
    const result = structuredClone(this.session);
    this.session.change = {
      cash: new Map<number, number>(
        this.wallet.acceptedCash.map((cash) => [cash, 0]),
      ),
      total: 0,
    };

    return result;
  }

  /**
   * Restores initial values for inventory and wallet
   */
  public restore(): void {
    if (!this.isSupplier) {
      throw new ExpandedError({
        message: "Only supplier can restore product",
      });
    }

    this.inventory = structuredClone(this.initialInventory.products);
    this.wallet = structuredClone(this.initialInventory.wallet);
  }

  /**
   * Logins as supplier
   */
  public loginSupplier(pass: string): void {
    if (this.isSupplier) {
      return;
    }

    if (this.session.amount > 0) {
      throw new ExpandedError({
        message: "Cannot login as supplier while a transaction is in progress",
      });
    }

    if (!EncryptMachine.equal(pass, this.supplierKey)) {
      throw new ExpandedError({
        message: "Invalid key",
      });
    }

    this.isSupplier = true;
  }

  /**
   * Logout from supplier account
   */
  public logoutSupplier(): void {
    if (!this.isSupplier) {
      return;
    }
    this.isSupplier = false;
  }

  /**
   * Returns if the current user is supplier or not
   */
  public isCurrentUserSupplier(): boolean {
    return this.isSupplier;
  }

  /**
   * Get current state info
   */
  public stateInfo(session?: Session): string {
    return [
      this.inventoryInfo(),
      this.sessionInfo(session || this.session),
      this.resetInfo(),
    ]
      .filter((value) => value !== "")
      .join("\n");
  }

  /**
   * Get registered products
   */
  public getProducts(): string[] {
    return Object.keys(this.inventory);
  }

  /**
   * Get registered products
   */
  public getAcceptedCashValues(): number[] {
    return [...this.wallet.acceptedCash];
  }
}
