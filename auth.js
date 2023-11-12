import jwt from 'jsonwebtoken';

export function withJwt(req, res, next) {
  try {
    if (req.header('Authorization') === undefined) {
      throw new Error('No token found');
    }

    const decoded = jwt.verify(
      req.header('Authorization').replace('Bearer ', ''),
      process.env.PRIVATE_KEY
    );

    req.jwt_payload = decoded.data;

    console.log({ decoded });

    if (!decoded) {
      throw new Error('Invalid token');
    }

    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
}
