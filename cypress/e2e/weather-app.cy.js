/// <reference types="cypress" />

const WAIT = 2000

describe('Weather App', () => {
  // api matcher
  const api = { method: 'GET', pathname: '/api/weather' }

  // runs before each test in this block
  beforeEach(() => {
    cy.visit('/')
  })

  // Test case 1: Check if the search form is displayed correctly
  it('shows the search form', () => {
    cy.title().should('eq', 'Weather App')
    cy.contains('h2', 'Weather App')
    cy.get('#city').should('have.attr', 'placeholder', 'Enter city (e.g. Dhaka)')
    cy.contains('button', 'Get Weather').should('be.visible')
    cy.wait(WAIT)
  })

  // Test case 2: Get real weather for Dhaka (live API)
  it('gets real weather for Dhaka (live API)', () => {
    cy.intercept(api).as('weather')
    cy.wait(WAIT)
    cy.get('#city').type('Dhaka', { delay: 150 })
    cy.wait(WAIT)
    cy.contains('button', 'Get Weather').click()

    cy.wait('@weather').its('response.statusCode').should('eq', 200)
    cy.get('#result')
      .should('contain', 'Location:')
      .and('contain', 'Temperature:')
      .and('contain', 'Time:')
    cy.wait(WAIT)
  })

  // Test case 3: Mock API response for Dhaka
  it('renders the values the API returns', () => {
    cy.intercept(api, {
      body: { location: 'Dhaka, Bangladesh', temperature: 31.5, time: '2026-10-11 18:45' },
    }).as('weather')
    cy.get('#city').type('Dhaka', { delay: 150 })
    cy.wait(WAIT)
    cy.contains('button', 'Get Weather').click()

    cy.wait('@weather')
    cy.get('#result')
      .should('contain', 'Dhaka, Bangladesh')
      .and('contain', '31.5 °C')
      .and('contain', '2026-10-11 18:45')
    cy.wait(WAIT)
  })

  // Test case 4: Default to Dhaka when the input is empty
  it('defaults to Dhaka when the input is empty', () => {
    cy.intercept(api, { body: { location: 'Dhaka', temperature: 30, time: 'now' } }).as('weather')
    cy.wait(WAIT)
    cy.contains('button', 'Get Weather').click()
    cy.wait(WAIT)
    cy.wait('@weather').its('request.url').should('include', 'city=Dhaka')
  })

  //Test case 5: Show a red error for an unknown city
  it('shows a red error for an unknown city', () => {
    cy.intercept(api, { statusCode: 404, body: {} }).as('weather')
    cy.get('#city').type('Atlantis', { delay: 150 })
    cy.wait(WAIT)
    cy.contains('button', 'Get Weather').click()

    cy.wait('@weather')
    cy.get('#result p')
      .should('have.text', 'City not found or API error')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
    cy.wait(WAIT)
  })
})
