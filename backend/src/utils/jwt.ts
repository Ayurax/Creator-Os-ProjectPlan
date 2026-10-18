import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret() {
  if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret_key_here_make_it_long_and_random' || JWT_SECRET === 'replace_with_a_long_random_secret') {
    throw new Error('JWT_SECRET must be configured before starting the backend');
  }
  return JWT_SECRET;
}

export function assertJwtConfig() {
  getJwtSecret();
}

export function signToken(payload: { userId: number; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, getJwtSecret()) as { userId: number; role: string };
}
