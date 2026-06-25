import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(userId, tipo) {
  return jwt.sign(
    { id: userId, tipo },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
    path: '/'
  });
}

export function clearAuthCookie(response) {
  response.cookies.delete('token');
}