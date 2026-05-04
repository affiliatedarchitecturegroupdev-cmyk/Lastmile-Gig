describe('Customer Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.get('body').should('be.visible');
  });

  it('should display search bar', () => {
    cy.get('input[type="search"]').should('exist');
  });

  it('should display restaurant list', () => {
    cy.get('[data-testid="restaurant-list"]').should('exist');
  });
});

describe('Restaurant Discovery', () => {
  beforeEach(() => {
    cy.visit('/restaurants');
  });

  it('should display cuisine filters', () => {
    cy.get('[data-testid="cuisine-filters"]').should('exist');
  });

  it('should filter by cuisine', () => {
    cy.get('[data-testid="cuisine-burger"]').click();
    cy.url().should('include', 'cuisine=burger');
  });

  it('should sort by rating', () => {
    cy.get('[data-testid="sort-rating"]').click();
    cy.url().should('include', 'sort=rating');
  });
});

describe('Cart Functionality', () => {
  beforeEach(() => {
    cy.visit('/cart');
  });

  it('should show empty cart message', () => {
    cy.get('[data-testid="empty-cart"]').should('exist');
  });

  it('should add item to cart', () => {
    cy.get('[data-testid="add-item"]').click();
    cy.get('[data-testid="cart-count"]').should('contain', '1');
  });
});

describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.visit('/checkout');
  });

  it('should display delivery address', () => {
    cy.get('[data-testid="delivery-address"]').should('exist');
  });

  it('should display payment methods', () => {
    cy.get('[data-testid="payment-methods"]').should('exist');
  });

  it('should calculate total correctly', () => {
    cy.get('[data-testid="order-total"]').should('exist');
  });
});