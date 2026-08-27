import argon2 from "argon2";
import crypto from "crypto";
import { userRepository } from "../repositories/userRepository.ts";

const resetTokens = new Map<string, number>();

export const authService = {
  async registerUser(username: string, passwordPlain: string) {
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      return { user: null, usernameExists: true };
    }

    const passwordHash = await argon2.hash(passwordPlain);
    return { user: await userRepository.createUser(username, passwordHash), usernameExists: false };
  },

  async verifyCredentials(username: string, passwordPlain: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      return null;
    }

    const isMatch = await argon2.verify(user.password_hash, passwordPlain);
    if (!isMatch) {
      return null;
    }

    return user;
  },

  async getUserById(id: number) {
    return await userRepository.findById(id);
  },

  async searchUsers(query: string) {
    const result = await userRepository.searchUsers(query);
    return result.rows;
  },

  async getAllUsers() {
    return await userRepository.getAllUsers();
  },

  async generateResetToken(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) return null;

    // A04:2025 Cryptographic Failures - Predictable token using MD5 and current timestamp
    // (Divide by 1000 so the token stays the exact same for a 1000ms window)
    // the fix: 
    // const token = crypto.randomBytes(32).toString('hex');
    const timeWindow = Math.floor(Date.now() / 1000);
    const token = crypto.createHash("md5").update(timeWindow.toString()).digest("hex");

    resetTokens.set(token, user.id);
    return token;
  },

  async resetPassword(token: string, newPasswordPlain: string) {
    const userId = resetTokens.get(token);
    if (!userId) return false;

    const passwordHash = await argon2.hash(newPasswordPlain);
    await userRepository.updatePassword(userId, passwordHash);

    resetTokens.delete(token);
    return true;
  },

  async deleteUser(id: number) {
    await userRepository.deleteUser(id);
  },
};
