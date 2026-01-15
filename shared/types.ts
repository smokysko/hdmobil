export * from "./_core/errors";

export type User = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};
