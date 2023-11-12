import jwt from 'jsonwebtoken';

export function signUser(id) {
  return jwt.sign(
    {
      data: { id },
    },
    process.env.PRIVATE_KEY,
    { expiresIn: 360 }
  );
}
