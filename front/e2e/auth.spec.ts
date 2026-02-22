import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'lolo@gmail.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'laurent31'

test.describe('Authentification', () => {
  test('ouvre la page Connexion au clic sur Se connecter', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Se connecter/i }).click()
    await expect(page).toHaveURL(/\/connection/)
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible()
  })

  test('connexion réussie puis redirection vers Partager et affichage Déconnexion', async ({ page }) => {
    await page.goto('/connection')
    await page.getByLabel(/Email/i).fill(TEST_EMAIL)
    await page.getByLabel(/Mot de passe/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Connexion/i }).click()
    await expect(page).toHaveURL(/\/partager/, { timeout: 10000 })
    await expect(page.getByRole('button', { name: /Déconnexion/i })).toBeVisible({ timeout: 10000 })
  })

  test('lien vers Créer un compte depuis la page Connexion', async ({ page }) => {
    await page.goto('/connection')
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
    await page.getByRole('link', { name: /Créer un compte/i }).click()
    await expect(page).toHaveURL(/\/inscription/)
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible({ timeout: 3000 })
  })

  test('inscription avec email unique puis Déconnexion visible', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`
    await page.goto('/inscription')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Mot de passe').first().fill('password')
    await page.getByLabel(/Vérification du mot de passe/).fill('password')
    await page.getByRole('button', { name: /Créer mon compte/i }).click()
    await expect(page.getByRole('button', { name: /Déconnexion/i })).toBeVisible({ timeout: 10000 })
  })
})
