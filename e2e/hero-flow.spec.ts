import { expect, test, type Page } from '@playwright/test'

/**
 * The demo-video journey, end to end, across every feature:
 * demo profile → RUKO → calm card → tell Rahul → script check → pushed to pay →
 * transfer pause → cancel. Rahul's phone (a second page, same browser) sees it all.
 */

async function answer(page: Page, choice: RegExp) {
  await page.getByRole('radio', { name: choice }).check()
  await page.getByRole('button', { name: /continue|see (the )?result|next/i }).click()
}

test('Kamla pauses a digital-arrest scam and keeps her money', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Try the demo' }).click()

  // During: the giant button opens the calm card.
  await page.getByRole('button', { name: /RUKO/ }).click()
  await expect(page).toHaveURL(/\/pause$/)
  await expect(page.getByText('Real police never arrest anyone on a video call.', { exact: false }).first()).toBeVisible()

  // Tell Rahul quietly.
  await page.getByRole('link', { name: 'Tell Rahul' }).click()
  await expect(page).toHaveURL(/\/tell$/)
  await page.getByRole('button', { name: 'Tell Rahul' }).click()
  await expect(page.getByText('Rahul has been told and will call you soon.')).toBeVisible()

  // Script check: three questions, one per page.
  await page.getByRole('link', { name: /check this call/i }).first().click()
  await expect(page).toHaveURL(/\/check\/1$/)
  await answer(page, /^yes/i)
  await expect(page).toHaveURL(/\/check\/2$/)
  await answer(page, /not sure/i)
  await expect(page).toHaveURL(/\/check\/3$/)
  await answer(page, /^yes/i)
  await expect(page).toHaveURL(/\/check\/result$/)
  await expect(page.getByText(/matches a digital-arrest scam/i).first()).toBeVisible()

  // Pushed to send money: the elder's own calm-moment rule pauses it.
  await page.getByRole('link', { name: 'They are pushing me to send money' }).click()
  await expect(page).toHaveURL(/\/transfer$/)
  await page.getByRole('button', { name: 'Send money' }).click()
  await expect(page).toHaveURL(/\/transfer\/paused$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('₹2,00,000')

  // Rahul's phone sees the alert and the paused payment.
  const rahul = await context.newPage()
  await rahul.emulateMedia({ reducedMotion: 'reduce' })
  await rahul.goto('/family')
  await expect(rahul.getByText(/opened Ruko during a call/i).first()).toBeVisible()
  await expect(rahul.getByRole('button', { name: /block this transfer/i })).toBeVisible()

  // Kamla cancels; the money is safe.
  await page.getByRole('button', { name: 'Cancel transfer — keep my money safe' }).click()
  await expect(page.getByText('Transfer cancelled. Your ₹2,00,000 is safe.').first()).toBeVisible()
})

test('the calm card works offline after the first visit', async ({ page, context }) => {
  await page.goto('/')
  // Let the service worker install and take control.
  await page.evaluate('navigator.serviceWorker.ready')
  await page.reload()
  await context.setOffline(true)
  await page.goto('/pause')
  await expect(page.getByText('Real police never arrest anyone on a video call.', { exact: false }).first()).toBeVisible()
  await expect(page.getByText("You're offline. Ruko still works.")).toBeVisible()
  await context.setOffline(false)
})
