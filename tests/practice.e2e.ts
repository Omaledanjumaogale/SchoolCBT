import { expect, test } from '@playwright/test'

test('signed-out users can run the live practice fallback and receive feedback', async ({
  page,
}) => {
  await page.goto('/practice')
  await page.evaluate(() => localStorage.clear())

  await expect(
    page.getByRole('heading', { name: /Real-Time AI-Agent CBT Practice/i }),
  ).toBeVisible()
  await expect(page.getByText('Local cache only')).toBeVisible()

  await page
    .getByRole('button', { name: /Start Live Batch|Start Practice/i })
    .first()
    .click()
  await expect(page.locator('.opt-btn')).toHaveCount(4)

  await page.locator('.opt-btn').first().click()
  await expect(
    page.locator('.rounded-xl', { hasText: /Correct answer|Great work/ }).first(),
  ).toBeVisible()
  await expect(page.getByText(/SCHOOLCBT LIVE CENTER/i)).toBeVisible()
  await expect(
    page.evaluate(() =>
      Object.keys(localStorage).some(key => key.startsWith('schoolcbt.practice')),
    ),
  ).resolves.toBe(true)
})

test('mock cbt flow responds to academic selectors and skip routing', async ({ page }) => {
  await page.goto('/practice')
  await page.evaluate(() => localStorage.clear())

  await page.getByLabel('Subject').selectOption('Mathematics')
  await page.getByLabel('Exam type').selectOption('JAMB')
  await page.getByLabel('Difficulty').selectOption('Hard')
  await page.getByLabel('CBT mode').selectOption('mock')
  await page.getByRole('button', { name: 'Algebra' }).click()
  await page
    .getByRole('button', { name: /Start Live Batch|Regenerate Batch/i })
    .first()
    .click()

  await expect(page.getByTestId('active-practice-context')).toContainText(
    'JAMB Mathematics · Mock CBT · Hard',
  )
  await expect(page.locator('.opt-btn')).toHaveCount(4)

  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText(/Skipped\. This question is cached/i)).toBeVisible()
  await expect(page.getByText('Restore Draft')).toBeEnabled()
})

test('dashboard redirects unauthenticated visitors to the public app', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('heading', { name: /Nigeria's Premier Results as a Service CBT Platform/i }),
  ).toBeVisible()
})
