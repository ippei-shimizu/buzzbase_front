import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const ALGORITHM = 'HS256';
const EXPIRATION_TIME = '5m';

interface JWTPayload {
  admin_user_id: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * NOTE: 管理者ユーザー用のJWTトークンを生成
 * サーバー間通信用（Next.js → Rails）
 */
export function generateInternalJWT(adminUserId: number): string {
  const payload = {
    admin_user_id: adminUserId,
    iss: 'buzzbase-nextjs',
    aud: 'buzzbase-rails'
  };

  return jwt.sign(payload, SECRET_KEY, {
    algorithm: ALGORITHM,
    expiresIn: EXPIRATION_TIME
  });
}

