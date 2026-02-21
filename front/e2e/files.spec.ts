import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'lolo@gmail.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'laurent31'

test.describe('Liste des fichiers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Connexion/i }).click()
    await page.getByLabel(/Email/i).fill(TEST_EMAIL)
    await page.getByLabel(/Mot de passe/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Se connecter/i }).click()
    await expect(page.getByRole('button', { name: /Déconnexion/i })).toBeVisible({ timeout: 10000 })
  })

  test('affiche la section Mes fichiers après connexion', async ({ page }) => {
    await page.getByRole('button', { name: /Mes fichiers/i }).click()
    await expect(page.getByTestId('files-stats')).toBeVisible()
    await expect(
      page.getByText(/fichier(s)? enregistré(s)?/).or(page.getByText('Aucun fichier pour le moment'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('affiche le filtre par tag (Tous au minimum)', async ({ page }) => {
    await page.getByRole('button', { name: /Mes fichiers/i }).click()
    await expect(page.getByText(/Filtrer par tag/)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Tous' })).toBeVisible()
  })

  test('cliquer sur Tous ne provoque pas d’erreur', async ({ page }) => {
    await page.getByRole('button', { name: /Mes fichiers/i }).click()
    await expect(page.getByRole('button', { name: 'Tous' })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Tous' }).click()
    await expect(page.getByTestId('files-stats')).toBeVisible()
  })
})
