export type Validation = {
  property: string;
  validator: (value: never) => boolean;
  message: string;
  optional?: boolean;
};

export type Issue = {
  property: string;
  error: string;
  value: string | number | never;
};

export type ErrorMetadata = {
  property?: string;
  issues: Issue[];
};
