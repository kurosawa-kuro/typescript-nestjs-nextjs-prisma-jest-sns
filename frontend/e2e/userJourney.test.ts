import { test } from '@playwright/test';
import { resetDatabase } from './utils/database';
import { loginUser, createMicroPost, verifyPost, logoutUser } from './utils/userActions';

test.beforeAll(async () => {
  await resetDatabase();
});

test('User journey: Login, create a micropost, and logout', async ({ page }) => {
  const POST_TITLE = `Test Post ${Date.now()}`; // Unique title for each test run

  try {
    // Step 1: Login
    await loginUser(page);

    // Step 2: Create a new post
    await createMicroPost(page, POST_TITLE);

    // Step 3: Verify the new post
    await verifyPost(page, POST_TITLE);

    // Step 4: Logout
    await logoutUser(page);
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
});