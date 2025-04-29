// src/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret'; // Store this securely in environment variables!

// Hash password
export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

// Compare hashed password
export const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
