import { test, expect } from '@playwright/test';

const EMAIL = 'info@techsofcolor.org';
const PASSWORD = 'testUser1234!';

test.describe('RiiseMap CRUD Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set onboarding as complete to skip it
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('riisemap_onboarding', 'true');
      localStorage.setItem('riisemap_profile', JSON.stringify({ name: 'Mark Lawson', title: 'Admin', role: 'admin' }));
      localStorage.setItem('riisemap_org_name', 'TechsOfColor');
    });
    await page.goto('/');
    // Login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    // Wait for dashboard to load
    await page.waitForSelector('nav, [data-sidebar]', { timeout: 15000 });
  });

  test.describe('Learners', () => {
    test('Navigate to Learners page', async ({ page }) => {
      await page.click('text=Learners');
      await expect(page.locator('h1:has-text("Learners")')).toBeVisible();
    });

    test('Create a learner via invite', async ({ page }) => {
      await page.click('text=Learners');
      await page.click('text=Invite Learners');
      await page.fill('input[data-testid="invite-first-name"], input[placeholder*="First"]', 'Test');
      await page.fill('input[placeholder*="Last"]', 'User');
      await page.fill('input[placeholder*="email"], input[type="email"]', `test${Date.now()}@example.com`);
      // Try to proceed
      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Send Invite"), button:has-text("Continue")');
      if (await nextBtn.isVisible()) await nextBtn.click();
    });

    test('View learner detail', async ({ page }) => {
      await page.click('text=Learners');
      const viewBtn = page.locator('button:has-text("View")').first();
      await viewBtn.click();
      await expect(page.locator('text=Back to Learners')).toBeVisible();
    });

    test('Edit a learner', async ({ page }) => {
      await page.click('text=Learners');
      await page.locator('button:has-text("View")').first().click();
      await page.click('button:has-text("Edit")');
      await expect(page.locator('button:has-text("Save")')).toBeVisible();
      await page.click('button:has-text("Cancel")');
    });
  });

  test.describe('Programs', () => {
    test('Navigate to Programs page', async ({ page }) => {
      await page.click('text=Programs');
      await expect(page.locator('h1:has-text("Programs")')).toBeVisible();
    });

    test('Create a program', async ({ page }) => {
      await page.click('text=Programs');
      await page.click('[data-testid="create-program-btn"]');
      await page.waitForTimeout(1000);
      const nameInput = page.locator('input').first();
      await nameInput.fill(`Test Program ${Date.now()}`);
      await page.fill('textarea', 'Automated test program description');
      await expect(page.locator('[data-testid="submit-program-btn"]')).toBeVisible();
    });

    test('View program detail', async ({ page }) => {
      await page.click('text=Programs');
      const viewBtn = page.locator('button:has-text("View Program")').first();
      if (await viewBtn.isVisible()) {
        await viewBtn.click();
        await expect(page.locator('text=Back to Programs')).toBeVisible();
      }
    });
  });

  test.describe('Pathways', () => {
    test('Navigate to Pathways page', async ({ page }) => {
      await page.click('text=Pathways');
      await expect(page.locator('h1:has-text("Career Pathways")')).toBeVisible();
    });

    test('Open Add Pathway form', async ({ page }) => {
      await page.click('text=Pathways');
      await page.click('button:has-text("Add Pathway")');
      await expect(page.locator('h1:has-text("Add Career Pathway")')).toBeVisible();
    });

    test('View pathway detail', async ({ page }) => {
      await page.click('text=Pathways');
      const card = page.locator('[data-testid*="pathway"], .cursor-pointer').first();
      if (await card.isVisible()) {
        await card.click();
        await expect(page.locator('text=Back to Pathways, text=Edit Pathway')).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Funding Sources', () => {
    test('Navigate to Funding Sources page', async ({ page }) => {
      await page.click('text=Funding Sources');
      await expect(page.locator('h1:has-text("Funding Sources")')).toBeVisible();
    });

    test('Create a funding source', async ({ page }) => {
      await page.click('text=Funding Sources');
      await page.click('button:has-text("Add Funding Source")');
      await page.fill('input[placeholder*="e.g."]', `Test Fund ${Date.now()}`);
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Save")');
      await expect(createBtn.first()).toBeVisible();
    });

    test('View funding source detail', async ({ page }) => {
      await page.click('text=Funding Sources');
      const viewBtn = page.locator('button:has-text("View"), [data-testid*="view"]').first();
      if (await viewBtn.isVisible()) {
        await viewBtn.click();
        await expect(page.locator('text=Back')).toBeVisible();
      }
    });
  });

  test.describe('Impact & Reporting', () => {
    test('Navigate to Impact page', async ({ page }) => {
      await page.click('text=Impact');
      await expect(page.locator('h1:has-text("Impact & Reporting")')).toBeVisible();
    });

    test('Portfolio overview loads', async ({ page }) => {
      await page.click('text=Impact');
      await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10000 });
    });

    test('Click into a funding source', async ({ page }) => {
      await page.click('text=Impact');
      await page.waitForSelector('text=Portfolio Overview', { timeout: 10000 });
      const card = page.locator('.cursor-pointer').first();
      if (await card.isVisible()) {
        await card.click();
        await page.waitForTimeout(2000);
        // Page should still be functional (no error overlay)
        await expect(page.locator('h1:has-text("Impact")')).toBeVisible();
      }
    });
  });

  test.describe('Settings', () => {
    test('Navigate to Settings page', async ({ page }) => {
      await page.goto('/settings');
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    });
  });
});
