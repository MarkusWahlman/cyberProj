import type { NextFunction } from 'express';
import type { TypedResponse, TypedRequestBody, TypedRequest } from '../utils/typedExpress.ts';
import { AuthSuccessResponseSchema, MessageResponseSchema, type AuthSuccessResponse, type MessageResponse, type ErrorResponse, type RegisterData } from 'shared';
import { authService } from '../services/authService.ts';

export const register = async (req: TypedRequestBody<RegisterData>, res: TypedResponse<AuthSuccessResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const {user: newUser, usernameExists} = await authService.registerUser(username, password);
    if(usernameExists){
      res.status(409).json({ message: 'Username already exists' });
      return;
    }
    if(!newUser){
      res.status(500).json({ message: 'Registration failed' });
      return;
    }
    
    req.login(newUser, (err) => {
      if (err) return next(err);
      res.status(201).json(AuthSuccessResponseSchema.parse({ 
        message: 'Registration successful', 
        user: newUser 
      }));
    });
  } catch (error) {
    next(error);
  }
};

export const login = (req: TypedRequest, res: TypedResponse<AuthSuccessResponse | ErrorResponse>) => {
  res.json(AuthSuccessResponseSchema.parse({ 
    message: 'Logged in successfully', 
    user: req.user 
  }));
};

export const logout = (req: TypedRequest, res: TypedResponse<MessageResponse | ErrorResponse>, next: NextFunction) => {
  req.logout((logoutErr) => {
    if (logoutErr) return next(logoutErr);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('connect.sid');
      res.json(MessageResponseSchema.parse({ message: 'Logged out successfully' }));
    });
  });
};

export const adminOnly = (req: TypedRequest, res: TypedResponse<AuthSuccessResponse | ErrorResponse>) => {
  res.json(AuthSuccessResponseSchema.parse({ message: 'Welcome Admin!', user: req.user }));
};
