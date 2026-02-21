import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'lolo@gmail.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'laurent31'

test.describe('Authentification', () => {
  test('ouvre la modal Connexion au clic sur Connexion', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Connexion/i }).click()
    await expect(page.getByRole('dialog').getByText('Connexion')).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible()
  })

  test('connexion réussie puis affichage Déconnexion', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Connexion/i }).click()
    await page.getByLabel(/Email/i).fill(TEST_EMAIL)
    await page.getByLabel(/Mot de passe/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Se connecter/i }).click()
    await expect(page.getByRole('button', { name: /Déconnexion/i })).toBeVisible({ timeout: 10000 })
  })

  test('lien vers Inscription depuis la modal Connexion', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Connexion/i }).click()
    await expect(page.getByRole('dialog').getByText('Connexion')).toBeVisible()
    await page.getByRole('button', { name: /S'inscrire/i }).click()
    await expect(page.getByRole('dialog').getByText('Inscription')).toBeVisible({ timeout: 3000 })
  })

  test('inscription avec email unique puis Déconnexion visible', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`
    await page.goto('/')
    await page.getByRole('button', { name: /Connexion/i }).click()
    await page.getByRole('button', { name: /S'inscrire/i }).click()
    await page.getByLabel('Nom').fill('E2E User')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Mot de passe').first().fill('password')
    await page.getByLabel(/Confirmation du mot de passe/).fill('password')
    await page.getByRole('button', { name: /S'inscrire/i }).click()
    await expect(page.getByRole('button', { name: /Déconnexion/i })).toBeVisible({ timeout: 10000 })
  })
})
