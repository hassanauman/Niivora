import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "ADMIN";
      customerType: "NORMAL" | "FOUNDER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "ADMIN";
    customerType: "NORMAL" | "FOUNDER";
  }
}
