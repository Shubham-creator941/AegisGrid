# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> AegisGrid System Golden Path >> Complete operational journey from login to audit
- Location: e2e/smoke.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button, a').filter({ hasText: 'Compare Recommendations' }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]: AEGISGRID
    - generic [ref=e11]:
      - generic [ref=e12]: Operations
      - list [ref=e13]:
        - listitem [ref=e14]:
          - link "Command Center" [ref=e15] [cursor=pointer]:
            - /url: /app/command-center
        - listitem [ref=e21]:
          - link "Network" [ref=e22] [cursor=pointer]:
            - /url: /app/network
        - listitem [ref=e28]:
          - link "Events" [ref=e29] [cursor=pointer]:
            - /url: /app/events
        - listitem [ref=e32]:
          - link "Scenarios" [ref=e33] [cursor=pointer]:
            - /url: /app/scenarios
        - listitem [ref=e38]:
          - link "Evaluations" [ref=e39] [cursor=pointer]:
            - /url: /app/evaluations
        - listitem [ref=e42]:
          - link "Recommendations" [ref=e43] [cursor=pointer]:
            - /url: /app/recommendations
        - listitem [ref=e47]:
          - link "Decisions" [ref=e48] [cursor=pointer]:
            - /url: /app/decisions
        - listitem [ref=e53]:
          - link "Audit" [ref=e54] [cursor=pointer]:
            - /url: /app/audit
    - generic [ref=e57]:
      - generic [ref=e63]:
        - generic [ref=e64]: admin@aegis.gov
        - generic [ref=e65]: ADMIN
      - button "Sign Out" [ref=e66]
  - generic [ref=e70]:
    - banner [ref=e71]:
      - generic [ref=e72]:
        - generic [ref=e73]: App
        - generic [ref=e76]: Evaluations
      - generic [ref=e77]:
        - generic [ref=e78]: Operational
        - button "Toggle Context Drawer" [ref=e83]
    - main [ref=e87]:
      - generic [ref=e88]:
        - generic [ref=e89]:
          - generic [ref=e90]:
            - heading "Evaluation Workspace" [level=1] [ref=e91]
            - generic [ref=e94]:
              - generic [ref=e95]: "ID: edf2beea-91c3-420a-a676-13d741806fd6"
              - generic [ref=e96]: •
              - generic [ref=e97]: "Scenario: Automated E2E Scenario"
              - generic [ref=e98]: •
              - generic [ref=e99]: "Engine: 1.0.0"
          - generic [ref=e104]:
            - button "Refresh Status" [ref=e105]
            - generic [ref=e111]: COMPLETED
        - generic [ref=e115]:
          - generic [ref=e120]:
            - paragraph [ref=e121]: Simulation Started
            - paragraph [ref=e122]: 9:37:35 AM
          - generic [ref=e130]:
            - paragraph [ref=e131]: Result Generated
            - paragraph [ref=e132]: 9:37:35 AM
        - generic [ref=e133]:
          - generic [ref=e134]:
            - heading "Causal Chain Impact Analysis" [level=3] [ref=e135]
            - generic [ref=e139]:
              - generic [ref=e141]:
                - paragraph [ref=e142]: Trigger
                - paragraph [ref=e143]: Disruption Scenario
                - paragraph [ref=e144]: Automated E2E Scenario
              - generic [ref=e145]:
                - paragraph [ref=e146]: Direct Impact
                - paragraph [ref=e147]: Supply Constraint
                - paragraph [ref=e148]: 0.0% drop
              - generic [ref=e149]:
                - paragraph [ref=e150]: Buffer Depletion
                - paragraph [ref=e151]: Reserve Impact
                - paragraph [ref=e152]: 0.0% depleted
              - generic [ref=e153]:
                - paragraph [ref=e154]: Systemic
                - paragraph [ref=e155]: Overall Severity
                - paragraph [ref=e156]: 0 / 100
          - generic [ref=e157]:
            - generic [ref=e158]:
              - button "Impact Calculation Details" [ref=e159]
              - generic [ref=e166]:
                - generic [ref=e167]:
                  - paragraph [ref=e168]: Supply Impact
                  - paragraph [ref=e169]: 0.00%
                - generic [ref=e170]:
                  - paragraph [ref=e171]: Economic Impact
                  - paragraph [ref=e172]: 0.00%
                - generic [ref=e173]:
                  - paragraph [ref=e174]: Operational Impact
                  - paragraph [ref=e175]: 0.00%
                - generic [ref=e176]:
                  - paragraph [ref=e177]: Resilience Impact
                  - paragraph [ref=e178]: 0.00%
                - generic [ref=e179]:
                  - text: "Engine Calculation Version:"
                  - generic [ref=e182]: 1.0.0-deterministic
            - button "Simulation Telemetry" [ref=e184]
            - generic [ref=e192]:
              - generic [ref=e193]:
                - generic [ref=e194]: Generated Candidate Responses
                - generic [ref=e197]: 0 Generated
              - paragraph [ref=e199]: No candidate responses were generated.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('AegisGrid System Golden Path', () => {
  4   |   test('Complete operational journey from login to audit', async ({ page }) => {
  5   |     // 1. Authentication
  6   |     await page.goto('/login');
  7   |     await page.fill('input[type="email"]', 'admin@aegis.gov');
  8   |     await page.fill('input[type="password"]', 'admin');
  9   |     await page.click('button[type="submit"]');
  10  | 
  11  |     // Should redirect to command center
  12  |     await expect(page).toHaveURL('/app/command-center');
  13  |     await expect(page.getByText('Network Overview')).toBeVisible();
  14  | 
  15  |     // 2. Navigate to Events
  16  |     await page.click('a[href="/app/events"]');
  17  |     await expect(page).toHaveURL('/app/events');
  18  | 
  19  |     // Wait for events to load and select the specific event that has AI Analysis seeded
  20  |     const targetEvent = page.locator('button').filter({ hasText: 'Strait of Hormuz Shipping Disruption' }).first();
  21  |     await targetEvent.waitFor({ state: 'visible' });
  22  |     await targetEvent.click();
  23  | 
  24  |     // 3. AI Analysis & Risk Workspace
  25  |     await expect(page.getByText('AI Analysis & Risk')).toBeVisible();
  26  |     await page.click('button:has-text("AI Analysis & Risk")');
  27  | 
  28  |     // 4. Navigate to Scenario Workspace
  29  |     const createScenarioBtn = page.getByRole('button', { name: 'Generate Response Scenarios' });
  30  |     await createScenarioBtn.waitFor({ state: 'visible' });
  31  |     await createScenarioBtn.click();
  32  | 
  33  |     await expect(page).toHaveURL(/.*\/app\/scenarios.*/);
  34  | 
  35  |     // 5. Fill Scenario fields and trigger Evaluation
  36  |     const nameInput = page.locator('input[placeholder="e.g., 30-Day Total Blockade"]');
  37  |     await nameInput.waitFor({ state: 'visible' });
  38  |     await nameInput.fill('Automated E2E Scenario');
  39  | 
  40  |     const descInput = page.locator('textarea[placeholder="Describe the nature of the disruption and expected operational impact..."]');
  41  |     await descInput.fill('Automated scenario for E2E golden path acceptance test.');
  42  | 
  43  |     const evaluateScenarioBtn = page.getByRole('button', { name: 'Evaluate Scenario' });
  44  |     await expect(evaluateScenarioBtn).toBeEnabled({ timeout: 10000 });
  45  |     await evaluateScenarioBtn.click();
  46  | 
  47  |     // 6. Evaluation page — evaluation runs synchronously; wait for results
  48  |     await expect(page).toHaveURL(/.*\/app\/evaluations.*/);
  49  |     const compareRecommendationsBtn = page.locator('button, a').filter({ hasText: 'Compare Recommendations' }).first();
> 50  |     await compareRecommendationsBtn.waitFor({ state: 'visible', timeout: 30000 });
      |                                     ^ Error: locator.waitFor: Test timeout of 30000ms exceeded.
  51  |     await compareRecommendationsBtn.click();
  52  | 
  53  |     // 7. Recommendations comparison page
  54  |     await expect(page).toHaveURL(/.*\/app\/recommendations.*/);
  55  |     await expect(page.getByText('Recommendation Comparison')).toBeVisible();
  56  | 
  57  |     // Fill rationale and submit ACCEPT decision
  58  |     const rationaleTextarea = page.locator('textarea[placeholder="Document human reasoning for this decision..."]');
  59  |     await rationaleTextarea.waitFor({ state: 'visible' });
  60  |     await rationaleTextarea.fill('E2E automated approval');
  61  | 
  62  |     // ACCEPT RECOMMENDATION is only enabled when the system-recommended candidate is selected (default)
  63  |     const acceptBtn = page.locator('button').filter({ hasText: 'ACCEPT RECOMMENDATION' }).first();
  64  |     await expect(acceptBtn).toBeEnabled({ timeout: 5000 });
  65  |     await acceptBtn.click();
  66  | 
  67  |     // 8. Verify decision was recorded on-screen
  68  |     await expect(page.getByText('Decision Recorded')).toBeVisible({ timeout: 10000 });
  69  | 
  70  |     // 9. Navigate to Audit Trail and verify DECISION_ACCEPT entry
  71  |     await page.click('a[href="/app/audit"]');
  72  |     await expect(page).toHaveURL('/app/audit');
  73  | 
  74  |     // Audit table must show the DECISION_ACCEPT action badge
  75  |     const decisionAuditBadge = page.locator('span').filter({ hasText: 'DECISION_ACCEPT' }).first();
  76  |     await decisionAuditBadge.waitFor({ state: 'visible', timeout: 10000 });
  77  | 
  78  |     // Click the audit row to open the detail panel
  79  |     await decisionAuditBadge.click();
  80  | 
  81  |     // Detail panel shows the rationale stored in after_state.reason
  82  |     await expect(page.getByText('E2E automated approval')).toBeVisible({ timeout: 5000 });
  83  |   });
  84  | });
  85  | 
  86  | test.describe('Failure Paths', () => {
  87  |   test('Unauthenticated access redirects to login', async ({ page }) => {
  88  |     await page.goto('/app/command-center');
  89  |     await expect(page).toHaveURL(/\/login/);
  90  |   });
  91  | 
  92  |   test('Shows bounded error on failed login', async ({ page }) => {
  93  |     await page.goto('/login');
  94  |     await page.fill('input[type="email"]', 'admin@aegis.gov');
  95  |     await page.fill('input[type="password"]', 'wrongpassword');
  96  |     await page.click('button[type="submit"]');
  97  |     await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  98  |   });
  99  | });
  100 | 
```