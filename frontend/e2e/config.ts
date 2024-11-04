import path from 'path';

export const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3001',
  EMAIL: 'alice@example.com',
  PASSWORD: 'hashed_password',
  IMAGE_FILE_NAME: 'test.png',
  TEST_IMAGE_PATH: path.join(__dirname, 'test-data', 'test.png'),
};