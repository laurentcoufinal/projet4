import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'lolo@gmail.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'laurent31'

test.describe('Liste des fichiers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connection')
    await page.getByLabel(/Email/i).fill(TEST_EMAIL)
    await page.getByLabel(/Mot de passe/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Connexion/i }).click()
    await expect(page).toHaveURL(/\/partager/, { timeout: 10000 })
    await expect(page.getByRole('button', { name: /Déconnexion/i })).toBeVisible({ timeout: 10000 })
  })

  test('affiche la section Mes fichiers après connexion', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mes fichiers' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Tous' })).toBeVisible()
    // Après chargement : message vide ou liste de fichiers
    await expect(
      page.getByText(/Aucun fichier pour le moment\./).or(page.getByRole('list')).or(page.getByText('Chargement…'))
    ).toBeVisible({ timeout: 15000 })
  })

  test('affiche les onglets Tous, Actifs, Expiré', async ({ page }) => {
    await expect(page.getByRole('tablist', { name: /Filtrer les fichiers/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('tab', { name: 'Tous' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Actifs' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Expiré' })).toBeVisible()
  })

  test('cliquer sur Tous ne provoque pas d’erreur', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Tous' })).toBeVisible({ timeout: 5000 })
    await page.getByRole('tab', { name: 'Tous' }).click()
    await expect(page.getByRole('heading', { name: 'Mes fichiers' })).toBeVisible()
  })
})
