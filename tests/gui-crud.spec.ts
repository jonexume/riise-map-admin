import { test, expect } from '@playwright/test';

const EMAIL = 'info@techsofcolor.org';
const PASSWORD = 'testUser1234!';
const TS = Date.now();

async function login(page: any) {
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
}

test.describe('GUI CRUD — Full Lifecycle', () => {

  test('Funding Source: create → update → delete', async ({ page }) => {
    await login(page);
    const name = `GUIFund_${TS}`;

    // CREATE
    await page.click('text=Funding Sources');
    await page.click('button:has-text("Add Funding Source")');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder*="e.g. City"]', name);
    await page.fill('textarea[placeholder*="goals"]', 'GUI test objectives');
    await page.fill('textarea[placeholder*="narrative"]', 'GUI test narrative');
    await page.fill('input[placeholder*="250000"]', '85000');
    await page.fill('input[placeholder*="50"]', '20');
    await page.fill('input[type="date"] >> nth=0', '2026-01-15');
    await page.fill('input[type="date"] >> nth=1', '2026-12-15');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(3000);
    await page.click('text=Funding Sources');
    await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });

    // UPDATE — click into the same record
    const viewBtn = page.locator(`text=${name}`).first().locator('..').locator('..').locator('button:has-text("View")');
    if (await viewBtn.isVisible()) await viewBtn.click();
    else await page.locator(`text=${name}`).first().click();
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Edit")');
    await page.waitForTimeout(500);
    await page.locator('textarea').first().fill('Updated objectives via GUI test');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);

    // DELETE — same record detail page
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    const confirmInput = page.locator('input[placeholder*="Type"]');
    await confirmInput.fill(name);
    await page.locator('button:has-text("Delete")').last().click();
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 5000 });
  });

  test('Program: create → update → delete', async ({ page }) => {
    await login(page);
    const name = `GUIProg_${TS}`;
    const tag = `gui-prog-${TS}`;

    // CREATE
    await page.click('text=Programs');
    await page.click('[data-testid="create-program-btn"]');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder*="Cloud Operations"]', name);
    await page.fill('input[placeholder*="cloud-ops"]', tag);
    await page.fill('textarea[placeholder*="Describe"]', 'GUI test program description');
    await page.fill('input[placeholder*="Summer"]', 'GUI Cohort 2026');
    // Funder select
    await page.click('text=Select a funding source');
    await page.locator('[role="option"]').first().click();
    await page.fill('input[type="date"] >> nth=0', '2026-02-01');
    await page.fill('input[type="date"] >> nth=1', '2026-11-30');
    await page.click('[data-testid="submit-program-btn"]');
    await page.waitForTimeout(3000);
    await page.click('text=Programs');
    await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });

    // UPDATE — same record
    const editBtn = page.locator(`text=${name}`).first().locator('..').locator('..').locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForTimeout(500);
    await page.fill('textarea', 'Updated via GUI test');
    await page.locator('button:has-text("Save"), button:has-text("Update")').first().click();
    await page.waitForTimeout(2000);

    // DELETE — same record via detail
    const viewBtn = page.locator(`text=${name}`).first().locator('..').locator('..').locator('button:has-text("View Program")');
    await viewBtn.click();
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    const confirmInput = page.locator('input[placeholder*="Type"]');
    if (await confirmInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmInput.fill(name);
    }
    await page.locator('button:has-text("Delete")').last().click();
    await page.waitForTimeout(3000);
  });

  test('Learner: create → update → delete', async ({ page }) => {
    await login(page);
    const firstName = 'GUILrn';
    const lastName = `T${TS}`;
    const fullName = `${firstName} ${lastName}`;
    const email = `guilrn_${TS}@example.com`;

    // CREATE
    await page.click('text=Learners');
    await page.click('text=Invite Learners');
    await page.waitForTimeout(500);
    await page.locator('input[placeholder*="First"]').fill(firstName);
    await page.locator('input[placeholder*="Last"]').fill(lastName);
    await page.locator('input[placeholder*="email"], input[type="email"]').first().fill(email);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);
    // Step 2 — select pathway/program if available
    const pathwaySelect = page.locator('text=Select pathway');
    if (await pathwaySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pathwaySelect.click();
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
    }
    const programSelect = page.locator('text=Select program');
    if (await programSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await programSelect.click();
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
    }
    await page.locator('button:has-text("Send"), button:has-text("Invite"), button:has-text("Submit")').first().click();
    await page.waitForTimeout(3000);
    await page.click('text=Learners');
    await expect(page.locator(`text=${firstName}`).first()).toBeVisible({ timeout: 5000 });

    // UPDATE — same record
    await page.locator(`text=${firstName}`).first().locator('..').locator('..').locator('button:has-text("View")').click();
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Edit")');
    await page.waitForTimeout(500);
    const coachInput = page.locator('label:has-text("Coach")').locator('..').locator('input');
    await coachInput.fill('GUI Test Coach');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);

    // DELETE — same record
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    const confirmInput = page.locator('input[placeholder*="Type"]');
    await confirmInput.fill(fullName);
    await page.locator('button:has-text("Delete Learner")').click();
    await page.waitForTimeout(2000);
    await expect(page.locator('h1:has-text("Learners")')).toBeVisible({ timeout: 5000 });
  });

  test('Pathway: create → update → delete', async ({ page }) => {
    await login(page);
    const name = `GUIPath_${TS}`;

    // CREATE
    await page.click('text=Pathways');
    await page.click('button:has-text("Add Pathway")');
    await page.waitForTimeout(500);
    await page.locator('input').first().fill(name);
    await page.locator('textarea').first().fill('GUI test pathway description');
    const durationSelect = page.locator('text=Select weeks');
    if (await durationSelect.isVisible()) {
      await durationSelect.click();
      await page.locator('[role="option"]:has-text("16")').click();
    }
    // Next through steps
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    const nextBtn2 = page.locator('button:has-text("Next")');
    if (await nextBtn2.isVisible()) { await nextBtn2.click(); await page.waitForTimeout(500); }
    // Submit
    await page.locator('button:has-text("Create Pathway"), button:has-text("Save")').first().click();
    await page.waitForTimeout(3000);
    await page.click('text=Pathways');
    await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });

    // UPDATE — same record
    await page.locator(`text=${name}`).first().click();
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Edit")');
    await page.waitForTimeout(500);
    await page.locator('textarea').first().fill('Updated via GUI test');
    const nextBtnEdit = page.locator('button:has-text("Next")');
    if (await nextBtnEdit.isVisible()) { await nextBtnEdit.click(); await page.waitForTimeout(300); }
    const nextBtnEdit2 = page.locator('button:has-text("Next")');
    if (await nextBtnEdit2.isVisible()) { await nextBtnEdit2.click(); await page.waitForTimeout(300); }
    await page.locator('button:has-text("Save"), button:has-text("Update")').first().click();
    await page.waitForTimeout(2000);

    // DELETE — same record (go back to detail first)
    await page.click('text=Pathways');
    await page.waitForTimeout(1000);
    await page.locator(`text=${name}`).first().click();
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    const confirmInput = page.locator('input[placeholder*="Type"]');
    await confirmInput.fill(name);
    await page.locator('button:has-text("Delete Pathway")').click();
    await page.waitForTimeout(2000);
  });
});
