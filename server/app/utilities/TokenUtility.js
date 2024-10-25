import { JWT_EXPIRE_TIME, JWT_SECRET_KEY } from '../config/config.js';
import jwt from 'jsonwebtoken';

export const TokenEncode = (email, role, user_id) => {
  const KEY = JWT_SECRET_KEY;
  const EXPIRE = { expiresIn: JWT_EXPIRE_TIME };
  const PAYLOAD = { email: email, role: role, user_id: user_id };
  return jwt.sign(PAYLOAD, KEY, EXPIRE);
};

export const TokenDecode = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
};
