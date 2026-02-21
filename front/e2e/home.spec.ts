import { test, expect } from '@playwright/test'

test.describe('Page d’accueil', () => {
  test('affiche le header avec le titre FileShare et le bouton Connexion', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /FileShare/i }).or(page.getByText('FileShare').first())
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /Connexion/i })).toBeVisible()
  })

  test('affiche les boutons Upload et Mes fichiers dans la nav', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Upload/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Mes fichiers/i })).toBeVisible()
  })

  test('la section Mes fichiers invite à se connecter quand non authentifié', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Mes fichiers/i }).click()
    await expect(page.getByText(/Connectez-vous pour voir vos fichiers/i)).toBeVisible()
  })
})
