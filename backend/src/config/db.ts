import { Kysely, PostgresDialect } from "kysely";
import type { Generated, Selectable } from "kysely";
import pkg from "pg";
const { Pool } = pkg;

export type Role = "user" | "admin";

export interface UserTable {
  id: Generated<number>;
  username: string;
  password_hash: string;
  role: Role;
}

export interface Database {
  users: UserTable;
}

declare global {
  namespace Express {
    interface User extends Selectable<UserTable> {}
  }
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

export async function initializeDb() {
  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("username", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("password_hash", "varchar(255)", (col) => col.notNull())
    .addColumn("role", "varchar(50)", (col) => col.notNull().defaultTo("user"))
    .execute();

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("sid", "varchar", (col) => col.primaryKey())
    .addColumn("sess", "json", (col) => col.notNull())
    .addColumn("expire", "timestamp(6)", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("IDX_session_expire")
    .ifNotExists()
    .on("session")
    .column("expire")
    .execute();
}
