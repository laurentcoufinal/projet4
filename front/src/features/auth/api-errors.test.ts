import { describe, it, expect } from 'vitest'
import { getApiErrorMessage } from './api-errors'

describe('getApiErrorMessage', () => {
  it('retourne fallback si err sans response', () => {
    expect(getApiErrorMessage(new Error('x'), 'Erreur')).toBe('Erreur')
    expect(getApiErrorMessage({}, 'Def')).toBe('Def')
  })

  it('retourne message si response.data.message est une string', () => {
    expect(
      getApiErrorMessage(
        { response: { data: { message: 'Email déjà utilisé' } } },
        'Erreur'
      )
    ).toBe('Email déjà utilisé')
  })

  it('retourne les errors jointes si response.data.errors (objet de tableaux)', () => {
    expect(
      getApiErrorMessage(
        {
          response: {
            data: {
              errors: {
                email: ['Le champ email est invalide.'],
                password: ['Mot de passe trop court.'],
              },
            },
          },
        },
        'Erreur'
      )
    ).toBe('Le champ email est invalide. • Mot de passe trop court.')
  })

  it('gère errors avec valeur string', () => {
    expect(
      getApiErrorMessage(
        { response: { data: { errors: { field: 'Une erreur' } } } },
        'Erreur'
      )
    ).toBe('Une erreur')
  })

  it('retourne fallback si data.errors est vide', () => {
    expect(
      getApiErrorMessage({ response: { data: { errors: {} } } }, 'Def')
    ).toBe('Def')
  })
})
