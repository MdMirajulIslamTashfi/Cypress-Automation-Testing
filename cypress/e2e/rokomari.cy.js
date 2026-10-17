/// <reference types="cypress" />

const BOOK_NAME_BN = 'তিনি ও সে'
const BOOK_NAME_EN = 'tini-o-se'
const BOOK_NAME_ID = '875'
const WAIT = 2000 // change this number to speed up or slow down

const CATEGORY = 'https://www.rokomari.com/book/category/1/book'

// ================== SET THESE BEFORE RUNNING ==================
const PAGE = 2 // which page of the category list
const ROW = 1 // which row on that page (1 = top row)
const COL = 1 // which column in that row (1 = leftmost)
// ===============================================================

const pageUrl = (page) => `${CATEGORY}?page=${page}`

// Grid tiles only. Matches the class prefix, since the hash suffix changes on site updates
const BOOK_LINK = 'a[class*="productContainer_productDetailsBody"]'

// A tile can have several links to the same book, so keep one per book
function uniqueBooks($links) {
  const seen = new Set()
  return $links.filter((_, a) => {
    const path = new URL(a.href).pathname
    if (seen.has(path)) return false
    seen.add(path)
    return true
  })
}

// Group visible tiles into rows by their screen position, then sort each row left to right
function gridRows($books) {
  const items = $books
    .toArray()
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0) // skip hidden duplicates
    .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)

  const rows = []
  for (const item of items) {
    const last = rows[rows.length - 1]
    if (last && Math.abs(last[0].rect.top - item.rect.top) < 10) last.push(item)
    else rows.push([item])
  }
  rows.forEach((row) => row.sort((a, b) => a.rect.left - b.rect.left))
  return rows
}

// Click the book by its ID, re-finding the link if the page re-renders
function openBook(path) {
  const id = path.split('/')[2] // "/book/123/some-name" → "123"
  cy.log(`Opening: ${decodeURIComponent(path)}`)

  // Remove target="_blank" at the moment of the click, so the book opens in this tab
  cy.document().then((doc) => {
    doc.addEventListener(
      'click',
      (e) => {
        const a = e.target.closest && e.target.closest('a')
        if (a) a.removeAttribute('target')
      },
      true,
    )
  })

  cy.get(`a[href*="/book/${id}/"]:has(img)`).first().click()
  cy.location('pathname', { timeout: 15000 }).should('include', `/book/${id}/`)
  cy.wait(WAIT)
}

// Search for the book and open its page from the results
function searchAndOpenBook() {
  searchBox().click().type(BOOK_NAME_BN, { delay: 150 })
  searchBox().type('{enter}')

  cy.contains('a[href*="/book/"]', BOOK_NAME_BN, { timeout: 15000 })
    .first()
    .scrollIntoView()
    .should('be.visible')
  cy.wait(WAIT)

  // remove target="_blank" so it opens in the SAME tab, then click
  cy.contains('a[href*="/book/"]', BOOK_NAME_BN).first().invoke('removeAttr', 'target').click()
  cy.wait(WAIT)

  cy.url({ timeout: 15000 }).should('include', '/book/')
  cy.contains(BOOK_NAME_BN).should('be.visible')
}

// Add the open book to the cart and go to the cart page
function addToCartAndOpenCart() {
  cy.contains('button', 'Add to Cart').should('be.visible').click()
  cy.wait(WAIT)

  cy.contains('button', 'Go to Cart ->').should('be.visible').click()
  cy.url({ timeout: 15000 }).should('include', '/cart')
  cy.contains(BOOK_NAME_BN).should('be.visible')
  cy.wait(WAIT)
}

// The site may have its own JS errors that are not related to our test.
// This stops Cypress from failing the test because of them.
Cypress.on('uncaught:exception', () => false)

// Finds the visible search box on the page
const searchBox = () => cy.get('input[type="text"]:visible, input[type="search"]:visible').first()

describe('Rokomari book search', () => {
  beforeEach(() => {
    cy.viewport(1366, 768)
    cy.visit('https://www.rokomari.com/')
    cy.wait(WAIT) // let the home page finish loading so you can see it
  })

  it('opens the Rokomari home page', () => {
    cy.url().should('include', 'rokomari.com')
    cy.title().should('contain', 'Rokomari')
    cy.wait(WAIT)
  })

  it('searches for the book name', () => {
    searchBox().should('be.visible').click()
    cy.wait(WAIT)

    searchBox().type(BOOK_NAME_BN, { delay: 150 }) // types slowly
    searchBox().type('{enter}')

    // We should now be on the search results page
    cy.url().should('include', 'search')
    cy.contains(BOOK_NAME_BN).should('exist')
    cy.wait(WAIT)
  })

  it('opens the book profile page from the search results', () => {
    searchAndOpenBook()
    cy.wait(WAIT * 2)
  })

  it('opens the book profile page directly', () => {
    cy.visit(`https://www.rokomari.com/book/${BOOK_NAME_ID}/${BOOK_NAME_EN}`)
    cy.wait(WAIT)

    cy.url({ timeout: 15000 }).should('include', '/book/')
    cy.contains(BOOK_NAME_BN).should('be.visible')
    cy.wait(WAIT * 2)
  })

  it('adds the book to the cart', () => {
    searchAndOpenBook()
    addToCartAndOpenCart()
  })

  it('proceeds to checkout from the cart page', () => {
    searchAndOpenBook()
    addToCartAndOpenCart()

    // Goes to the checkout step only; this test never places an order
    cy.contains('button', 'অর্ডার করতে এগিয়ে যান').click()
    cy.wait(WAIT)
  })
})

describe('Rokomari category grid', () => {
  // beforeEach(() => cy.viewport(1920, 4623.5))
  beforeEach(() => cy.viewport(1920, 1080))

  it(`opens the book on page ${PAGE}, row ${ROW}, column ${COL}`, () => {
    cy.visit(pageUrl(PAGE))
    cy.get(BOOK_LINK, { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then(($links) => {
        const rows = gridRows(uniqueBooks($links))
        cy.log(`${rows.length} rows, books per row: ${rows.map((r) => r.length).join(', ')}`)

        expect(ROW, 'row exists').to.be.at.most(rows.length)
        expect(COL, 'column exists in that row').to.be.at.most(rows[ROW - 1].length)

        const target = rows[ROW - 1][COL - 1].el
        cy.wrap(target).scrollIntoView().invoke('css', 'outline', '4px solid red')
        cy.wait(WAIT) // look at the red box before it clicks

        openBook(new URL(target.href).pathname)
      })
  })

  it('opens a random book from a random page', () => {
    cy.visit(pageUrl(1))
    cy.get('a[href*="page="]', { timeout: 15000 }).then(($links) => {
      const pages = $links
        .toArray()
        .map((a) => Number(new URL(a.href).searchParams.get('page')))
        .filter((n) => n > 0)
      const lastPage = Math.max(...pages)
      const page = Cypress._.random(1, lastPage)
      cy.log(`Random page ${page} of ${lastPage}`)
      cy.visit(pageUrl(page))
    })

    cy.get(BOOK_LINK, { timeout: 15000 }).then(($links) => {
      const books = uniqueBooks($links)
      const index = Cypress._.random(0, books.length - 1)
      cy.log(`Random book #${index + 1} of ${books.length}`)
      openBook(new URL(books[index].href).pathname)
    })
  })
})
