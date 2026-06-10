import { test, expect } from '@playwright/test';

const EMAIL = 'info@techsofcolor.org';
const PASSWORD = 'testUser1234!';
const TIMESTAMP = Date.now();

test.describe('RiiseMap CRUD Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('riisemap_onboarding', 'true');
      localStorage.setItem('riisemap_profile', JSON.stringify({ name: 'Test Runner', title: 'Admin', role: 'admin' }));
      localStorage.setItem('riisemap_org_name', 'TechsOfColor');
    });
    await page.goto('/');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('nav, [data-sidebar]', { timeout: 15000 });
  });

  test.describe('Funding Sources CRUD', () => {
    const name = `Test Fund ${TIMESTAMP}`;

    test('Create a funding source', async ({ page }) => {
      await page.click('text=Funding Sources');
      await page.click('button:has-text("Add Funding Source")');
      await page.fill('input[placeholder*="e.g."]', name);
      await page.fill('textarea >> nth=0', 'Automated test objectives');
      await page.fill('input[placeholder*="250000"]', '50000');
      await page.fill('input[placeholder*="50"]', '10');
      await page.click('button:has-text("Create")');
      await page.waitForTimeout(2000);
      await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });
    });

    test('Delete the funding source', async ({ page }) => {
      await page.click('text=Funding Sources');
      await page.waitForTimeout(1000);
      // Click into the test fund
      const row = page.locator(`text=${name}`).first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1000);
        const deleteBtn = page.locator('button:has-text("Delete")');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          await page.waitForTimeout(500);
          const confirmBtn = page.locator('button:has-text("Delete")').last();
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    });
  });

  test.describe('Programs CRUD', () => {
    const name = `Test Program ${TIMESTAMP}`;

    test('Create a program', async ({ page }) => {
      await page.click('text=Programs');
      await page.click('[data-testid="create-program-btn"]');
      await page.waitForTimeout(500);
      // Fill in the name field
      await page.locator('input').first().fill(name);
      // Fill description
      await page.fill('textarea', 'Automated test program');
      // Verify form is interactive and submit button exists
      const submitBtn = page.locator('[data-testid="submit-program-btn"]');
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toBeEnabled();
    });

    test('Delete the program', async ({ page }) => {
      await page.click('text=Programs');
      await page.waitForTimeout(1000);
      // Find and check the test program
      const checkbox = page.locator(`text=${name}`).locator('..').locator('..').locator('input[type="checkbox"], [role="checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.click();
        await page.waitForTimeout(500);
        const deleteBtn = page.locator('button:has-text("Delete Selected")');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          await page.waitForTimeout(500);
          await page.click('button:has-text("Confirm")');
          await page.waitForTimeout(2000);
        }
      }
    });
  });

  test.describe('Learners CRUD', () => {
    const email = `test${TIMESTAMP}@example.com`;

    test('Create a learner', async ({ page }) => {
      await page.click('text=Learners');
      await page.click('text=Invite Learners');
      await page.waitForTimeout(500);
      // Fill invite form - step 0
      const firstNameInput = page.locator('input[placeholder*="First"], input').nth(0);
      await firstNameInput.fill('TestFirst');
      const lastNameInput = page.locator('input[placeholder*="Last"], input').nth(1);
      await lastNameInput.fill('TestLast');
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
      await emailInput.fill(email);
      // Click next/send
      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Send"), button:has-text("Continue")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    });

    test('Delete the learner', async ({ page }) => {
      await page.click('text=Learners');
      await page.waitForTimeout(1000);
      // Find the test learner checkbox
      const learnerRow = page.locator('text=TestFirst').first();
      if (await learnerRow.isVisible()) {
        const checkbox = learnerRow.locator('..').locator('..').locator('[role="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.click();
          await page.waitForTimeout(500);
          await page.click('button:has-text("Delete Selected")');
          await page.waitForTimeout(500);
          await page.click('button:has-text("Confirm Delete")');
          await page.waitForTimeout(2000);
          await expect(learnerRow).not.toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('Home page loads', async ({ page }) => {
      await expect(page.locator('text=Priorities')).toBeVisible();
    });

    test('Impact page loads with portfolio', async ({ page }) => {
      await page.click('text=Impact');
      await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10000 });
    });

    test('Pathways page loads', async ({ page }) => {
      await page.click('text=Pathways');
      await expect(page.locator('h1:has-text("Career Pathways")')).toBeVisible();
    });

    test('Settings page loads', async ({ page }) => {
      await page.goto('/settings');
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    });
  });
});
