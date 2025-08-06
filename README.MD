# Requirements

Code a Vending Machine which:

- Accepts coins of 0.05, 0.10, 0.20, 0.50, 1, 2 coins (the currency doesn’t matter)
- Allow user to select products Coke(1.50), Pepsi(1.45), Water(0.90)
- Allow user to take refund by cancelling the request.
- Return selected product and remaining change if any
- Allow reset operation for vending machine supplier.

Constraints:

- Databases are not allowed. Save the state in memory.
- Assume the UI is console based; no need to write a web or desktop GUI unless that is your preference.
- You can use Node.js and an IDE of your choice.
- Use the minimum number of external libraries.

# Info

## Questions && Assumptions:

In order to avoid unnecessary work, I would clarify the following with the product/client, to make sure we arrive at the desired outcomes.

> **Q:** Does the machine accept multiple coins at once and sorts them automatically, or only one coin at a time?
>
> **A:** The assumption is that the machine accepts and processes one coin at a time.

> **Q:** Can the user select multiple product types in one transaction, or only one product type? How about the number of units per product type?
>
> **A:** The assumption is that the user can select only one product type per transaction, but can choose multiple units of that product.

> **Q:** Does the user add money before selecting a product, or select the product first and then pay?
>
> **A:** There are three possible flows:
>
> - Pay first, then select.
> - Select first, then pay.
> - A flexible flow that supports both — user at any time before completing the purchase can add extra money in case he changed his mind and decided that he will buy more in the same transaction
>
> Current usage:
>
> - Option 2 — user selects the product, then pays.
>
> Recommendation:
>
> - Implement Option 3 for better adaptability and user experience.

> **Q:** Does the machine support an initial setup for configuring products, accepted coins, and bills?
>
> **A:** The assumption is that initial setup is not yet implemented — current functionality only supports reset operations limited to restocking products and resetting the wallet.
>
> Contextual note:
>
> - In cases such as relocating the machine to a different environment (e.g., new region with different currency or product needs), a full setup cycle would be required to configure accepted coins/bills and initial product lineup — this is currently outside the supported functionality.

> **Q:** What does the "reset" operation mean? What exactly can be reset?
>
> **A:** One possible implementation of the reset operation is to prompt the operator to manually input the quantity of each product and coin during restocking.
>
> Example: If the machine should have two Cokes, the system could ask: “How many Cokes did you insert?” — assuming the machine has a maximum capacity per product that should not be exceeded.
>
> Additional assumptions:
>
> - Each spiral in the vending machine holds a limited number of items.
> - It’s unclear whether the machine tracks inventory using spiral rotation counts or via a weight sensor.
>
> Working assumption:
>
> - The reset operation restores the product inventory and coin wallet to their initial state. For the current implementation, limits on maximum coins and product capacity will be ignored.

> **Q:** Are there multiple user types?
>
> > **A:** Based on the term "vending machine supplier," the assumption is that there are two user roles: a regular user (customer) and a supplier (operator).
>
> For this exercise, I will implement a simple login mechanism for the supplier role using a password set during the vending machine's creation, along with a way to exit that role.
>
> Note: In a production environment, this would likely be replaced by a more robust role-based access control (RBAC) system.

> **Q:** What does “if any” mean in the context of “Return selected product and remaining change, if any”?
>
> **A:** This can be interpreted in three ways:
>
> - Mandatory change: Return the remaining change if available; if the machine cannot provide the exact change, the transaction is denied.
> - Optional change: Return change if available; otherwise, complete the transaction without returning any.
> - User-confirmed fallback: Return change if available; if not, prompt the user to confirm whether they wish to proceed without receiving change.
>
> Recommendation: Option 3 offers the best user experience and supports revenue retention by giving users the choice.
>
> Implementation for this exercise: I will proceed with Option 1 — the machine must return the exact change; otherwise, the transaction is canceled.

## Actions:

- select (product, quantity)
  - Info:
    - select product to put in cart
    - quantity ca be optional -> the default value is to add one
  - Constraints:
    - cannot select product if the payment process has already started. Payment has to be canceled to apply action
    - cannot select product if the supplier is logged on
- remove (product, quantity)
  - Info:
    - remove product from cart
    - quantity ca be optional -> the default value is to remove one
  - Constraints:
    - cannot remove product if the payment process has already started. Payment has to be canceled to apply action
    - cannot remove product if the supplier is logged on
- pay (cash)
  - Info:
    - start the payment process and add cash to temporary wallet
  - Actions:
    - if the payment is not equal to total needed value for products
      - add to session wallet and update total
      - return session
    - if the payment is over the needed total and the machine has enough cash to give change if necessary:
      - return the change and the money payed over, and the products bought
      - update inventory and wallet
      - clear session
      - return session - wallet (contains change)
  - Constraints:
    - if the machine does not have enough cash to give change, reject the cash given
    - if the supplier is logged on cannot proceeds with any payments
- cancel (type: "payment" | "all" )
  - "payment"
    - Info:
      - cancels the current payment
      - if the current request has not started the payment action yet, there is nothing to be done
    - Actions:
      - returns all money from temporary wallet to user
  - "all"
    - Info:
      - uses the "payment" flow
      - removes all products from current session
  - Constraints:
    - if the supplier is logged on cannot proceeds with cancel action
- restore
  - Info:
    - Restore all values to their initial values (products and wallet cash)
  - Constraints:
    - Only supplier can restore
- login supplier
  - Info:
    - Logins as a supplier to enable supplier actions
    - Need key to login (used at vending machine creation)
- logout
  - Info:
    - Logouts from supplier menu
    - If the supplier is already logged out, ignore and just return

## Improvements

### Architecture and Communication

- Vending client (machine) communicates with the vending server (APIs/WebSockets) over a secured channel.
- Security measures include:
  - IP whitelisting
  - Mutual TLS / certificate-based authentication between the client and server

### Operational Insights & Optimization

- Opportunities:
  - Generate automated resupply alerts/warnings based on stock levels or sales frequency.
- Expected Results:
  - Improved selection of restocked products tailored to actual purchase behavior at each location.
  - Cost optimization for resupply operations — fewer unnecessary trips and better stock efficiency (fuel + inventory).

### Future-Proof Design

1. Plugin-based hardware abstraction
   - Abstract interactions with physical components (coin validator, display, dispenser) via interfaces or drivers.
   - Allows swapping or upgrading hardware (e.g., card readers, biometric scanners) without rewriting business logic.
2. Command-driven backend (CQRS/Event Sourcing)
   - Introduce clear separation between commands (e.g., restock, purchase) and queries (e.g., product availability) for scalability and auditability.
   - Enables future integration with analytics and machine learning.
3. Feature toggles / flags
   - Use feature flags to enable or disable new capabilities per machine remotely (e.g., promotions, new payment options).
4. Remote firmware/config updates
   - Implement OTA (Over-the-Air) updates for software, configs, and pricing models.
5. Real-time telemetry and diagnostics
   - Push periodic health data (temperature, component failures, stock status) for predictive maintenance.
6. Offline-first design
   - Allow local caching and queueing of user actions (e.g., sales, errors) to handle temporary network outages gracefully.
7. Hardware-bound keys and TPM integration
   - Secure sensitive operations (e.g., payment, identity) with Trusted Platform Modules (TPM) or secure elements.
8. Audit logging
   - Maintain an append-only audit trail for regulatory or troubleshooting purposes.
9. GDPR-ready user interaction
   - If collecting user data (e.g., loyalty systems), build in opt-in mechanisms and data erasure capabilities.
10. Multi-payment support
    - Prepare for multiple payment providers (card, NFC, QR, mobile wallets).
    - Use a payment gateway abstraction layer to integrate various providers with minimal effort.
11. Refund and dispute handling
    - Plan for remote or in-machine refund logic, with traceability to specific transactions.
12. Support for multiple locales and currencies
    - Use internationalization libraries for UI/messages and currency formatting.
    - Define pricing and product metadata per region/machine.
13. Admin dashboard with role-based access control
    - For managing machines, viewing logs, pushing updates, and analyzing performance.
14. Machine simulation environment
    - A mock/simulated vending machine environment for testing changes before deploying to physical devices.

### Security & Configuration Management

- Sensitive hardcoded values (e.g., credentials, machine-specific settings) are strictly excluded from source files.
- These values are managed via environment variables, injected at deployment/runtime for better security and maintainability.

# Flows

## End 2 End

### Test flow 1

Select one product and pay with exact cash. Return products and amount payed.

- Action: select, 1 "Coke"
- Action: pay, 1 cash (one: 1)
- Action: pay, 1 cash (fifty-cents: 1)
  ```
    {
      products: {
        "Coke": 1
      },
      amount: 1.5,
      change: {
        total: 0,
        cash: {
          ...
        }
      },
      ...
    }
  ```

### Test flow 2

Select tow products and pay. Return products, amount payed and change.

- Action: select, 1 "Coke"
- Action: select, 1 "Pepsi"
- Action: pay, cash (two)
- Action: pay, cash (two)
  ```
    {
      products: {
        "Coke": 1,
        "Pepsi": 1
      },
      amount: 2.95,
      change: {
        cash: {
          "five-cents": 1,
          "one": 1
          ...
        },
        total: 1.05
      },
      ...
    }
  ```

### Test flow 3

Select same product and pay with over payment

- Action: select(Water: 1)
- Action: select(Water: 1)
- Action: pay (one: 1)
- Action: pay (fifty-cents: 1)
- Action: pay (twenty-cents: 1)
- Action: pay (two: 1)
  ```
    {
      products: {
        "Water": 2
      },
      amount: 1.8,
      change: {
        cash: {
          "fifty-cents": 2,
          "twenty-cents": 2,
          "one": 1,
          ...
        }
        "total": 1.9,
      },
      ...
    }
  ```

### Test flow 4

Select same product, remove all products one by one

- Action: select(Water: 1)
- Action: select(Water: 1)
- Action: remove (Water: 1)
- Action: remove (Water: 1)
  ```
    {
      products: {
      },
      amount: 0,
      payment: {
        total: 0
        cash: {
          ...
        }
      },
      ...
    }
  ```

### Test flow 5

Select same product, pay and cancel everything

- Action: select(Water: 1)
- Action: select(Water: 1)
- Action: pay (one: 1)
- Action: pay (fifty-cents: 1)
- Action: pay (twenty-cents: 1)
  ```
    {
      products: {
      },
      amount: 0,
      change: {
        cash: {
          "fifty-cents": 1,
          "twenty-cents": 1,
          "one": 1,
        }
        "total": 1.7,
      },
      ...
    }
  ```

# Frameworks, tools and version

| Tool       | Version | Type                 | Notes                                     |
| ---------- | ------- | -------------------- | ----------------------------------------- |
| Jest       | ^29.7.0 | testing framework    |                                           |
| Node       | 24.5.0  | runtime environment  |                                           |
| Npm        | 11.5.1  | node package manager |                                           |
| Prettier   | ^3.6.2  | code formatter       |                                           |
| Eslint     | ^8.35.1 | linter               |                                           |
| Typescript | ^5.8.3  | language             |                                           |
| Nodemon    | ^3.1.10 | command-line tool    | Used for dev start to auto restart server |
| TSUP       | ^8.5.0  | typescript bundler   |                                           |
| Babel      | ^7.27.2 | JavaScript compiler  | Used to parse tests from ts to js         |

# Scripts usage:

| Script     | Description                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| build      | Compiles the TypeScript source code into JavaScript using tsup, a fast bundler powered by esbuild. Creates a dist/ folder with compiled files. Run before production deployment. |
| start      | Starts the production-ready JavaScript application. You’ve already built the project using tsup, so dist/index.js exists.                                                        |
| start:dev  | Starts the app in development mode with live reload on TypeScript file changes.                                                                                                  |
| format     | Formats all .ts files in src/ using Prettier. Mutates files to match Prettier style rules. Run before commits to ensure consistent code formatting.                              |
| lint       | Runs ESLint on your codebase . ESLint is configured for TypeScript. Code quality enforcement and cleanup.                                                                        |
| lint-fix   | Runs ESLint on your codebase and attempts to automatically fix problems.                                                                                                         |
| test       | Runs all test files using Jest. One-time run for CI or local validation.                                                                                                         |
| test:watch | Runs tests and reruns them when files change. TDD/BDD or active test development.                                                                                                |
| test:debug | Runs Jest in debug mode with Node’s debugger enabled. Debugging failing or complex tests using breakpoints.                                                                      |

How to run scripts:

```
  npm run <script-name>
```
