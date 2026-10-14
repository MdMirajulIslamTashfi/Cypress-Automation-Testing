/// <reference types="cypress" />

it('searches for a term on Google', () => {
  cy.visit('https://www.google.com')
  cy.get('[name="q"]').type('Cypress', { delay: 150 })
  cy.get('[name="q"]').type('{enter}')
  it('google search (human solves CAPTCHA if shown)', () => {
    cy.visit('https://www.google.com')
    cy.get('[name="q"]').type('Cypress{enter}')

    // Google's CAPTCHA page lives at /sorry/
    cy.url().then((url) => {
      if (url.includes('/sorry/')) cy.pause() // solve it, then click ▶ Resume
    })
    cy.contains('cypress.io').should('be.visible')
  })
})
