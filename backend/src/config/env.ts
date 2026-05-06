const jwtSecret = process.env.JWT_SECRET ?? '';

if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export const env = {
  jwtSecret,
};