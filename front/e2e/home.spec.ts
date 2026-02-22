import { test, expect } from '@playwright/test'

test.describe('Page d’accueil', () => {
  test('affiche le header avec le titre DataShare et le lien Se connecter', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('DataShare').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Se connecter/i })).toBeVisible()
  })

  test('la page Partager affiche "Mes fichiers" et invite à se connecter quand non authentifié', async ({ page }) => {
    await page.goto('/partager')
    await expect(page.getByRole('heading', { name: 'Mes fichiers' })).toBeVisible()
    await expect(page.getByText(/Connectez-vous pour voir et gérer vos fichiers/i)).toBeVisible()
  })
})
