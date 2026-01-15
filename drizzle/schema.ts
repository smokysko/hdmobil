export type User = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

export type InsertUser = Partial<User> & { id: string };
