import { expect, test, type Page } from '@playwright/test';

const clearStorageAndOpen = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
};

const openView = async (page: Page, view: 'Overview' | 'Board' | 'List' | 'Timeline') => {
  await page.getByRole('button', { name: view }).first().click();
};

test.describe('TaskFlow Pro workspace', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageAndOpen(page);
  });

  test('loads the focused workspace and switches between core views', async ({ page }) => {
    await expect(page.getByText('TaskFlow Pro')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Product Roadmap', exact: true })).toBeVisible();
    await expect(page.getByText('Open tasks')).toBeVisible();

    await openView(page, 'Board');
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();

    await openView(page, 'List');
    await expect(page.getByText('Design System Architecture')).toBeVisible();
    await expect(page.getByText('Implement Auth Flow')).toBeVisible();

    await openView(page, 'Timeline');
    await expect(page.getByRole('heading', { name: 'Timeline', exact: true })).toBeVisible();
    await expect(page.getByText('Unscheduled')).toBeVisible();
  });

  test('creates a task from a reusable template', async ({ page }) => {
    await page.getByRole('button', { name: 'Add task' }).click();
    await page.locator('form select').first().selectOption('launch-task');
    await expect(page.locator('input[value="Prepare launch deliverable"]')).toBeVisible();
    await page.getByRole('button', { name: 'Create task', exact: true }).click();

    await expect(page.getByText('Task created')).toBeVisible();
    await openView(page, 'List');
    await expect(page.getByRole('main').getByText('Prepare launch deliverable').first()).toBeVisible();
  });

  test('edits task details and records comments/activity', async ({ page }) => {
    await openView(page, 'List');
    await page.getByText('Design System Architecture').click();
    await expect(page.getByText('Task details')).toBeVisible();

    await page.locator('aside input').first().fill('Design System Foundations');
    await page.getByPlaceholder('Add a comment').fill('Ready for design review.');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(page.getByText('Comment added', { exact: true })).toBeVisible();
    await expect(page.getByText('Ready for design review.')).toBeVisible();
    await expect(page.getByText('Comment added by You')).toBeVisible();

    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Task updated')).toBeVisible();
    await expect(page.getByRole('main').getByText('Design System Foundations').first()).toBeVisible();
  });

  test('uses assistant proposed actions with confirmation', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: 'Here is a concise risk note and a focused next step for the current board.'
        })
      });
    });

    await page.getByLabel('Open assistant').click();
    await page.getByRole('button', { name: 'Draft a short risk and blocker note from this board.' }).click();

    await expect(page.getByText('Here is a concise risk note')).toBeVisible();
    await page.getByRole('button', { name: /Create follow-up task/ }).click();
    await expect(page.getByText('Apply assistant action?')).toBeVisible();
    await page.getByRole('button', { name: 'Apply action' }).click();
    await expect(page.getByText('Assistant task created')).toBeVisible();

    await page.getByLabel('Close assistant').click();
    await openView(page, 'List');
    await expect(page.getByRole('main').getByText('Follow up: Draft a short risk').first()).toBeVisible();
  });

  test('supports bulk list actions and sample data reset', async ({ page }) => {
    await openView(page, 'List');
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    await expect(page.getByText('2 selected')).toBeVisible();
    await page.getByRole('button', { name: 'Set high priority' }).click();
    await expect(page.getByText('Bulk update applied')).toBeVisible();

    await page.getByRole('button', { name: 'Reset sample data' }).click();
    await expect(page.getByText('Reset sample workspace?')).toBeVisible();
    await page.getByRole('button', { name: 'Reset data' }).click();
    await expect(page.getByText('Sample workspace restored')).toBeVisible();
  });
});

test.describe('TaskFlow Pro API proxy', () => {
  test('validates empty assistant payloads without exposing Gemini secrets', async ({ request }) => {
    const response = await request.post('/api/chat', { data: {} });
    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain('Send at least one message');
  });
});
