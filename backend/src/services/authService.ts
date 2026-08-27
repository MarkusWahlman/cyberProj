import argon2 from 'argon2';
import { userRepository } from '../repositories/userRepository.ts';

export const authService = {
  async registerUser(username: string, passwordPlain: string) {
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      return {user: null, usernameExists: true};
    }
    
    const passwordHash = await argon2.hash(passwordPlain);
    return {user: await userRepository.createUser(username, passwordHash), usernameExists: false};
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
  }
};
