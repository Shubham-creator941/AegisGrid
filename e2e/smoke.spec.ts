import { test, expect } from '@playwright/test';

test.describe('AegisGrid System Golden Path', () => {
  test('Complete operational journey from login to audit', async ({ page }) => {
    // 1. Authentication
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@aegis.gov');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Should redirect to command center
    await expect(page).toHaveURL('/app/command-center');
    await expect(page.getByText('Network Overview')).toBeVisible();

    // 2. Navigate to Events
    await page.click('a[href="/app/events"]');
    await expect(page).toHaveURL('/app/events');

    // Wait for events to load and select the specific event that has AI Analysis seeded
    const targetEvent = page.locator('button').filter({ hasText: 'Strait of Hormuz Shipping Disruption' }).first();
    await targetEvent.waitFor({ state: 'visible' });
    await targetEvent.click();

    // 3. AI Analysis & Risk Workspace
    await expect(page.getByText('AI Analysis & Risk')).toBeVisible();
    await page.click('button:has-text("AI Analysis & Risk")');

    // 4. Navigate to Scenario Workspace
    const createScenarioBtn = page.getByRole('button', { name: 'Generate Response Scenarios' });
    await createScenarioBtn.waitFor({ state: 'visible' });
    await createScenarioBtn.click();

    await expect(page).toHaveURL(/.*\/app\/scenarios.*/);

    // 5. Fill Scenario fields and trigger Evaluation
    const nameInput = page.locator('input[placeholder="e.g., 30-Day Total Blockade"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Automated E2E Scenario');

    const descInput = page.locator('textarea[placeholder="Describe the nature of the disruption and expected operational impact..."]');
    await descInput.fill('Automated scenario for E2E golden path acceptance test.');

    const evaluateScenarioBtn = page.getByRole('button', { name: 'Evaluate Scenario' });
    await expect(evaluateScenarioBtn).toBeEnabled({ timeout: 10000 });
    await evaluateScenarioBtn.click();

    // 6. Evaluation page — evaluation runs synchronously; wait for results
    await expect(page).toHaveURL(/.*\/app\/evaluations.*/);
    
    // Check if evaluation explicitly generated 0 candidates due to Specification Gap (Defect #3)
    const noCandidatesMessage = page.getByText('No candidate responses were generated.');
    const compareRecommendationsBtn = page.locator('button, a').filter({ hasText: 'Compare Recommendations' }).first();
    
    // Wait for either the Compare button or the Empty state
    await Promise.race([
      compareRecommendationsBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
      noCandidatesMessage.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {})
    ]);

    expect(await noCandidatesMessage.isVisible(), 'BLOCKED — SPECIFICATION / PRODUCT GAP (Defect #3). The deterministic engine generated 0 candidates because generation rules are not defined in the specification. Golden Path cannot proceed to Recommendation Comparison.').toBe(false);

    await compareRecommendationsBtn.click();

    // 7. Recommendations comparison page
    await expect(page).toHaveURL(/.*\/app\/recommendations.*/);
    await expect(page.getByText('Recommendation Comparison')).toBeVisible();

    // Fill rationale and submit ACCEPT decision
    const rationaleTextarea = page.locator('textarea[placeholder="Document human reasoning for this decision..."]');
    await rationaleTextarea.waitFor({ state: 'visible' });
    await rationaleTextarea.fill('E2E automated approval');

    // ACCEPT RECOMMENDATION is only enabled when the system-recommended candidate is selected (default)
    const acceptBtn = page.locator('button').filter({ hasText: 'ACCEPT RECOMMENDATION' }).first();
    await expect(acceptBtn).toBeEnabled({ timeout: 5000 });
    await acceptBtn.click();

    // 8. Verify decision was recorded on-screen
    await expect(page.getByText('Decision Recorded')).toBeVisible({ timeout: 10000 });

    // 9. Navigate to Audit Trail and verify DECISION_ACCEPT entry
    await page.click('a[href="/app/audit"]');
    await expect(page).toHaveURL('/app/audit');

    // Audit table must show the DECISION_ACCEPT action badge
    const decisionAuditBadge = page.locator('span').filter({ hasText: 'DECISION_ACCEPT' }).first();
    await decisionAuditBadge.waitFor({ state: 'visible', timeout: 10000 });

    // Click the audit row to open the detail panel
    await decisionAuditBadge.click();

    // Detail panel shows the rationale stored in after_state.reason
    await expect(page.getByText('E2E automated approval')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Failure Paths', () => {
  test('Unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/app/command-center');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Shows bounded error on failed login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@aegis.gov');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });
});
