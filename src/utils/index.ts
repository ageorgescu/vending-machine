import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import util from "util";

import { ErrorMetadata, Validation } from "./types";

export class EncryptMachine {
  private static SALT = randomBytes(16).toString("hex");

  public static encrypt(text: string): string {
    return pbkdf2Sync(
      text,
      EncryptMachine.SALT,
      100_000,
      64,
      "sha512",
    ).toString("hex");
  }

  public static equal(text: string, hash: string): boolean {
    const hashText = pbkdf2Sync(
      text,
      EncryptMachine.SALT,
      100_000,
      64,
      "sha512",
    );
    const buffer = Buffer.from(hash, "hex");
    return timingSafeEqual(hashText, buffer);
  }
}

export class Validator {
  static validate(options: {
    object: object | never;
    validations: Validation[];
  }) {
    const { object, validations } = options;
    const validationErrors = [];

    if (!object) {
      validationErrors.push({
        property: ".",
        error: "Object sent to validation does not exist",
      });
    } else {
      for (const validation of validations) {
        const { property, validator, message, optional } = validation;
        const value = object[property];
        if (value === undefined) {
          if (!optional) {
            validationErrors.push({
              property,
              error: "Property does not exist",
            });
          }

          continue;
        }
        if (!validator(value as never)) {
          validationErrors.push({
            property,
            value,
            error: message,
          });
        }
      }
    }

    return validationErrors.length ? validationErrors : undefined;
  }
}

export class ExpandedError extends Error {
  private metadata?: ErrorMetadata | { [key: string]: string | number };
  private cause?: ExpandedError;

  constructor(options: {
    message: string;
    metadata?: ErrorMetadata | { [key: string]: string | number };
    cause?: ExpandedError;
  }) {
    super(options.message);

    this.metadata = options.metadata;
    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  private getMessage(error: ExpandedError, level = 0): string {
    if (!error) {
      return "";
    }

    const causeMessage = error.getMessage(error.cause, level + 1);

    let message: string = "";
    if (level > 0) {
      const base = `\n${"\t".repeat(level)}`;

      if (error.metadata) {
        const metadataString = JSON.stringify(error.metadata, null, 2);
        const metadataParts = metadataString.split("\n");
        for (
          let metadataIndex = 0;
          metadataIndex < metadataParts.length;
          metadataIndex += 1
        ) {
          if (metadataIndex > 20) {
            break;
          }
          const metadata = metadataParts[metadataIndex];
          if (metadataIndex === 0) {
            message += `${base}Metadata: ${metadata}`;
          } else {
            message += `${base}${metadata}`;
          }
        }
      }

      if (this.stack) {
        const stacks = error.stack.split("\n");
        for (let stackIndex = 0; stackIndex < stacks.length; stackIndex += 1) {
          if (stackIndex > 5) {
            break;
          }
          const stack = stacks[stackIndex];
          if (stackIndex === 0) {
            message += `${base}caused by: ${stack}`;
          } else {
            message += `${base}${stack}`;
          }
        }
      } else {
        message = `${base}caused by: ${message}`;
      }
    } else {
      message = `${error.name}: ${error.message}`;
    }

    return `${message}${causeMessage}`;
  }

  toString() {
    return this.getMessage(this);
  }

  [util.inspect.custom]() {
    return this.toString();
  }
}

export class FloatOperations {
  public static add(...items: number[]): number {
    let result = 0;
    for (const item of items) {
      result += 100 * item;
    }
    return Math.round(result) / 100;
  }

  public static subtract(...items: number[]): number {
    let result: number = 2 * items[0] * 100;
    for (const item of items) {
      result -= 100 * item;
    }
    return Math.round(result) / 100;
  }

  public static multiply(...items: number[]): number {
    let result: number = items[0];
    for (const itemIndex in items) {
      const item = items[itemIndex];
      if (itemIndex === "0") {
        continue;
      }
      result *= item;
    }

    return result;
  }
}
