const BOOK_NAME_BN = 'তিনি ও সে'
const BOOK_NAME_EN = 'tini-o-se'
const BOOK_NAME_ID = '875'
const WAIT = 2000 // change this number to speed up or slow down

const CATEGORY = 'https://www.rokomari.com/book/category/1/book'
const pageUrl = (page) => `${CATEGORY}?page=${page}` // confirm the param name (step 2 below)

// Fill these in with real selectors (see "Find the selectors")
const SEL = {
  card: '.book-list-wrapper', // one book tile in the grid (repeats for every book)
  title: '.book-title', // the title text inside a tile
  pageLinks: '.pagination a', // pagination number links
  productTitle: 'h1', // the title on the book's own page
}

// How many columns the grid has = how many tiles share the first tile's row
function columnCount($cards) {
  const top = $cards[0].getBoundingClientRect().top
  return $cards.filter((_, el) => Math.abs(el.getBoundingClientRect().top - top) < 5).length
}

// Click a tile and check we landed on that same book
function openBook($card) {
  const title = $card.find(SEL.title).text().trim()
  cy.log(`Opening: ${title}`)
  cy.wrap($card)
    .find('a')
    .first()
    .invoke('removeAttr', 'target') // keep it in the same tab; Cypress can't follow new tabs
    .click()
  cy.get(SEL.productTitle).should('contain', title)
}

// The site may have its own JS errors that are not related to our test.
// This stops Cypress from failing the test because of them.
Cypress.on('uncaught:exception', () => false)

// Finds the visible search box on the page
const searchBox = () => cy.get('input[type="text"]:visible, input[type="search"]:visible').first()

describe('Rokomari book search', () => {
  beforeEach(() => {
    cy.viewport(1366, 768) // fixed width so the grid layout is consistent
    cy.visit('https://www.rokomari.com/')
    cy.wait(WAIT) // let the home page finish loading so you can see it
  })

  // it('opens the Rokomari home page', () => {
  //   cy.url().should('include', 'rokomari.com')
  //   cy.title().should('contain', 'Rokomari')

  //   cy.wait(WAIT)
  // })

  // it('searches for the book name', () => {
  //   searchBox().should('be.visible').click()
  //   cy.wait(WAIT)

  //   searchBox().type(BOOK_NAME_BN, { delay: 150 }) // types slowly
  //   searchBox().type('{enter}')

  //   // We should now be on the search results page
  //   cy.url().should('include', 'search')
  //   cy.contains(BOOK_NAME_BN).should('exist')

  //   cy.wait(WAIT)
  // })

  // it('opens the book profile page from the search results', () => {
  //   // Step 1: type the book name and search
  //   searchBox().click().type(BOOK_NAME_BN, { delay: 150 })
  //   searchBox().type('{enter}')

  //   // Step 2: find the book link in the results
  //   cy.contains('a[href*="/book/"]', BOOK_NAME_BN, { timeout: 15000 })
  //     .first()
  //     .scrollIntoView()
  //     .should('be.visible')
  //   cy.wait(WAIT)

  //   // Step 3: remove target="_blank" so it opens in the SAME tab, then click
  //   cy.contains('a[href*="/book/"]', BOOK_NAME_BN).first().invoke('removeAttr', 'target').click()
  //   cy.wait(WAIT)

  //   // Step 4: check that the book profile page opened
  //   cy.url({ timeout: 15000 }).should('include', '/book/')
  //   cy.contains(BOOK_NAME_BN).should('be.visible')

  //   cy.wait(WAIT * 2)
  // })

  // it('opens the book profile page directly', () => {
  //   // Step 1: visit the book profile page directly
  //   cy.visit(`https://www.rokomari.com/book/${BOOK_NAME_ID}/${BOOK_NAME_EN}`)
  //   cy.wait(WAIT)

  //   // Step 2: check that the book profile page opened
  //   cy.url({ timeout: 15000 }).should('include', '/book/')
  //   cy.contains(BOOK_NAME_BN).should('be.visible')

  //   cy.wait(WAIT * 2)
  // })

  // it('opens the book profile page from the search results and adds to cart', () => {
  //   // Step 1: type the book name and search
  //   searchBox().click().type(BOOK_NAME_BN, { delay: 150 })
  //   searchBox().type('{enter}')

  //   // Step 2: find the book link in the results
  //   cy.contains('a[href*="/book/"]', BOOK_NAME_BN, { timeout: 15000 })
  //     .first()
  //     .scrollIntoView()
  //     .should('be.visible')
  //   cy.wait(WAIT)

  //   // Step 3: remove target="_blank" so it opens in the SAME tab, then click
  //   cy.contains('a[href*="/book/"]', BOOK_NAME_BN).first().invoke('removeAttr', 'target').click()
  //   cy.wait(WAIT)

  //   // Step 4: check that the book profile page opened
  //   cy.url({ timeout: 15000 }).should('include', '/book/')
  //   cy.contains(BOOK_NAME_BN).should('be.visible')

  //   // Step 5: click the "Add to Cart" button
  //   cy.contains('button', 'Add to Cart').should('be.visible').click()
  //   cy.get('#js--add-to-cart-button').click()
  //   cy.wait(WAIT)

  //   // Step 6: check that the cart page opened
  //   cy.get('#js--add-to-cart-button').click()
  //   cy.url({ timeout: 15000 }).should('include', '/cart')
  //   cy.contains(BOOK_NAME_BN).should('be.visible')

  //   cy.wait(WAIT * 2)
  // })

  // it('proceeds to checkout from the cart page', () => {
  //   // Step 1: type the book name and search
  //   searchBox().click().type(BOOK_NAME_BN, { delay: 150 })
  //   searchBox().type('{enter}')

  //   // Step 2: find the book link in the results
  //   cy.contains('a[href*="/book/"]', BOOK_NAME_BN, { timeout: 15000 })
  //     .first()
  //     .scrollIntoView()
  //     .should('be.visible')
  //   cy.wait(WAIT)

  //   // Step 3: remove target="_blank" so it opens in the SAME tab, then click
  //   cy.contains('a[href*="/book/"]', BOOK_NAME_BN).first().invoke('removeAttr', 'target').click()
  //   cy.wait(WAIT)

  //   // Step 4: check that the book profile page opened
  //   cy.url({ timeout: 15000 }).should('include', '/book/')
  //   cy.contains(BOOK_NAME_BN).should('be.visible')

  //   // Step 5: click the "Add to Cart" button
  //   cy.contains('button', 'Add to Cart').should('be.visible').click()
  //   cy.get('#js--add-to-cart-button').click()
  //   cy.wait(WAIT)

  //   // Step 6: check that the cart page opened
  //   cy.contains('button', 'Go to Cart ->').should('be.visible').click()
  //   cy.url({ timeout: 15000 }).should('include', '/cart')
  //   cy.contains(BOOK_NAME_BN).should('be.visible')
  //   cy.wait(WAIT)

  //   // Step 2: click the "Proceed to Checkout" button
  //   cy.contains('button', 'অর্ডার করতে এগিয়ে যান').should('be.visible').click()
  //   cy.wait(WAIT)
  // })

  it('searches book from book category', () => {
    searchBox().should('be.visible').click().type('বই{enter}')
    cy.wait(WAIT)

    // cy.contains('a', 'সাহিত্য').should('be.visible').click()
    // cy.wait(WAIT)

    // cy.contains('a', 'উপন্যাস').should('be.visible').click()
    // cy.wait(WAIT)

    // searchBox().should('be.visible').click()
    // cy.wait(WAIT)

    // searchBox().type(BOOK_NAME_BN, { delay: 150 }) // types slowly
    // searchBox().type('{enter}')

    // // We should now be on the search results page
    // cy.url().should('include', 'search')
    // cy.contains(BOOK_NAME_BN).should('exist')

    // cy.wait(WAIT)
  })

  it('opens the book at a given page, row and column', () => {
    const page = Cypress.env('page') || 1
    const row = Cypress.env('row') || 1
    const col = Cypress.env('col') || 1

    cy.visit(pageUrl(page))
    cy.get(SEL.card)
      .should('have.length.greaterThan', 0)
      .then(($cards) => {
        const cols = columnCount($cards)
        const index = (row - 1) * cols + (col - 1)
        cy.log(`Page ${page}, row ${row}, col ${col} → book #${index + 1} (${cols} columns)`)
        expect(index, 'that row/column exists on the page').to.be.lessThan($cards.length)
        openBook($cards.eq(index))
      })
  })

  it('opens a random book from a random page', () => {
    cy.visit(pageUrl(1))
    cy.get(SEL.pageLinks).then(($links) => {
      const numbers = $links
        .toArray()
        .map((a) => parseInt(a.innerText, 10))
        .filter((n) => !isNaN(n))
      const lastPage = Math.max(...numbers)
      const page = Cypress._.random(1, lastPage)
      cy.log(`Random page ${page} of ${lastPage}`)
      cy.visit(pageUrl(page))
    })

    cy.get(SEL.card)
      .should('have.length.greaterThan', 0)
      .then(($cards) => {
        const index = Cypress._.random(0, $cards.length - 1)
        cy.log(`Random book #${index + 1} of ${$cards.length}`)
        openBook($cards.eq(index))
      })
  })
})
