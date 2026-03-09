process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db-skip-real';
process.env.JWT_SECRET = process.env.JWT_SECRET || '58d6f9a2ece8922fb4fb8bde06d980187ea3d4184b5febd25f0ab3f4feb8edf9';
process.env.JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';