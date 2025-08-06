import readline from "readline";

import { VendingMachine } from "../vending-machine";
import { Session } from "../vending-machine/types";
import { CLIENT_INFO_COMMANDS, SUPPLIER_INFO_COMMANDS } from "./constants";
import { Commands } from "./enums";

export class ConsoleUserInterface {
  private instance: VendingMachine;
  private interface: readline.Interface;

  constructor(instance: VendingMachine) {
    this.instance = instance;
    this.interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => this.completer(line, this.instance),
    });
  }

  private completer(line: string, instance: VendingMachine) {
    const words = line.trim().split(" ");
    const [cmd, ...args] = words;

    if (words.length === 1) {
      const commands = Object.values(Commands);
      const hits = commands.filter((c) => c.startsWith(cmd));
      return [hits.length ? hits : commands, cmd];
    }

    switch (cmd) {
      case Commands.SELECT:
      case Commands.REMOVE:
        return [
          Object.values(instance.getProducts()).filter((p) =>
            p.startsWith(args[0] || ""),
          ),
          args[0] || "",
        ];
      default:
        return [[], line];
    }
  }

  private handleClientCommands(cmd: string, args: string[]): boolean {
    try {
      let result: Session | string;
      let isUnknownCommand = false;
      switch (cmd) {
        case Commands.SELECT:
          result = this.instance.select(args[0], Number(args[1] || 1));
          break;
        case Commands.REMOVE:
          result = this.instance.remove(args[0], Number(args[1] || 1));
          break;
        case Commands.PAY:
          result = this.instance.pay(
            parseFloat(args[0]),
            parseInt(args[1] ?? "1"),
          );
          break;
        case Commands.CANCEL_PAYMENT:
          result = this.instance.cancel("payment");
          break;
        case Commands.CANCEL:
          result = this.instance.cancel();
          break;
        case Commands.RESTORE:
          this.instance.restore();
          result = this.instance.stateInfo();
          break;
        case Commands.STATE:
          result = this.instance.stateInfo();
          break;
        case Commands.LOGIN:
          this.instance.loginSupplier(args[0]);
          result = SUPPLIER_INFO_COMMANDS;
          result += `\n${this.instance.stateInfo()}`;
          break;
        case Commands.EXIT:
          this.interface.close();
          return true;
        case Commands.INFO:
          result = CLIENT_INFO_COMMANDS;
          break;
        default:
          isUnknownCommand = true;
          result = CLIENT_INFO_COMMANDS;
      }

      if (isUnknownCommand) {
        console.log("Unknown command");
      }

      if (result) {
        if (result.constructor === "".constructor) {
          console.log(result);
        } else if ((result as Session).change) {
          console.log(this.instance.stateInfo(result as Session));
        }
      }
      return false;
    } catch (err) {
      console.error("❌", err.message);
    }
  }

  private handleSupplierCommands(cmd: string): void {
    try {
      let result: string;
      let isUnknownCommand = false;
      switch (cmd) {
        case Commands.RESTORE:
          this.instance.restore();
          result = this.instance.stateInfo();
          break;
        case Commands.STATE:
          result = this.instance.stateInfo();
          break;
        case Commands.LOGOUT:
          this.instance.logoutSupplier();
          result = CLIENT_INFO_COMMANDS;
          result += `${this.instance.stateInfo()}`;
          break;
        case Commands.INFO:
          result = SUPPLIER_INFO_COMMANDS;
          break;
        default:
          result = SUPPLIER_INFO_COMMANDS;
          isUnknownCommand = true;
      }

      if (isUnknownCommand) {
        console.log("Unknown command");
      }

      if (result) {
        console.log(result);
      }
    } catch (err) {
      console.error("❌", err.message);
    }
  }

  private prompt() {
    this.interface.question("\n> ", async (input: string) => {
      try {
        const [cmd, ...args] = input.trim().split(/\s+/);
        if (this.instance.isCurrentUserSupplier()) {
          this.handleSupplierCommands(cmd);
        } else {
          const exit = this.handleClientCommands(cmd, args);
          if (exit) {
            return;
          }
        }
      } catch (err) {
        console.error("❌", err.message);
      }
      this.prompt();
    });
  }

  public run() {
    console.log("Welcome to the Vending Machine!");
    console.log(CLIENT_INFO_COMMANDS);
    console.log(this.instance.stateInfo());
    this.prompt();
  }
}
