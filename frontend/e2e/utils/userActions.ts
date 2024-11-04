import { expect, Page } from '@playwright/test';
import { CONFIG } from '../config';

export async function loginUser(page: Page): Promise<void> {
  await page.goto(CONFIG.BASE_URL);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Email').fill(CONFIG.EMAIL);
  await page.getByLabel('Password').fill(CONFIG.PASSWORD);
  await page.locator('form').getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
}

export async function createMicroPost(page: Page, postTitle: string): Promise<void> {
  await page.getByRole('button').first().click();
  await page.locator('input[type="file"]').setInputFiles(CONFIG.TEST_IMAGE_PATH);
  await page.getByLabel('Title').fill(postTitle);
  await page.getByRole('button', { name: 'Share' }).click();
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden' });
}

export async function verifyPost(page: Page, postTitle: string): Promise<void> {
  const newPost = page.locator(`h2:has-text("${postTitle}")`).first();
  await expect(newPost).toBeVisible();
  const postImage = page.locator(`img[alt="${postTitle}"]`).first();
  await expect(postImage).toBeVisible();
}

export async function logoutUser(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
}