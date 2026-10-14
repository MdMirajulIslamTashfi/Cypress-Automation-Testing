/// <reference types="cypress" />

// 1. visit the login page eticket railway bd at first and then search for available trains
it('visit the login page eticket railway bd', () => {
  cy.visit('https://eticket.railway.gov.bd/login')
  cy.get('#mobile_number').type('your_username')
  cy.get('#password').type('your_password')
  cy.url().then((url) => {
    if (url.includes('/sorry/')) cy.pause() // solve it, then click ▶ Resume
  })
  cy.contains('cypress.io').should('be.visible')

  cy.get('#login_btn').click()
})
