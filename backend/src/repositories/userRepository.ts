import { db } from '../config/db.ts';

export const userRepository = {
  findByUsername(username: string) {
    return db.selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();
  },

  findById(id: number) {
    return db.selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  createUser(username: string, passwordHash: string, role: string = 'user') {
    return db.insertInto('users')
      .values({ username, password_hash: passwordHash, role })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
};
