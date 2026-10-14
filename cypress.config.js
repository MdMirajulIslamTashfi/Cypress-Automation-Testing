const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://example.cypress.io',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    video: false,
  },
})
