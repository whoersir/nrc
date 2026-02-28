import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check that page loaded (basic smoke test)
    await expect(page).toHaveTitle(/.*/);
  });

  test('should have no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });
});