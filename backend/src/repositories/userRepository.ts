import { db } from "../config/db.ts";
import type { Role } from "../config/db.ts";
import { sql } from "kysely";

export const userRepository = {
  findByUsername(username: string) {
    return db.selectFrom("users").selectAll().where("username", "=", username).executeTakeFirst();
  },

  findById(id: number) {
    return db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
  },

  getAllUsers() {
    return db.selectFrom("users").selectAll().execute();
  },

  createUser(username: string, passwordHash: string, role: Role = "user") {
    return db
      .insertInto("users")
      .values({ username, password_hash: passwordHash, role })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  searchUsers(query: string) {
    // Flaw 4:
    // A05:2025 Injection - Using raw SQL string concatenation
    // the fix: 
    // return db.selectFrom('users').selectAll().where('username', 'like', `%${query}%`).execute();
    return sql`SELECT * FROM users WHERE username LIKE '%${sql.raw(query)}%'`.execute(db);
  },

  updatePassword(id: number, passwordHash: string) {
    return db
      .updateTable("users")
      .set({ password_hash: passwordHash })
      .where("id", "=", id)
      .executeTakeFirst();
  },

  deleteUser(id: number) {
    return db.deleteFrom("users").where("id", "=", id).executeTakeFirst();
  },
};
