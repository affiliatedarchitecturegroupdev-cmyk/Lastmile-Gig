describe('Partner Dashboard', () => {
  beforeEach(() => {
    cy.visit('/partner');
    cy.loginAsPartner();
  });

  it('should show dashboard overview', () => {
    cy.get('[data-testid="dashboard-stats"]').should('exist');
  });

  it('should display orders list', () => {
    cy.get('[data-testid="orders-list"]').should('exist');
  });

  it('should filter orders by status', () => {
    cy.get('[data-testid="filter-preparing"]').click();
    cy.url().should('include', 'status=preparing');
  });
});

describe('Menu Management', () => {
  beforeEach(() => {
    cy.visit('/partner/menu');
  });

  it('should display menu categories', () => {
    cy.get('[data-testid="menu-categories"]').should('exist');
  });

  it('should add new menu item', () => {
    cy.get('[data-testid="add-item"]').click();
    cy.get('[data-testid="item-name"]').type('Test Item');
    cy.get('[data-testid="item-price"]').type('99');
    cy.get('[data-testid="save-item"]').click();
    cy.get('[data-testid="success-message"]').should('exist');
  });

  it('should toggle item availability', () => {
    cy.get('[data-testid="item-toggle"]').first().click();
    cy.get('[data-testid="item-status"]').should('contain', 'Unavailable');
  });
});

describe('Operating Hours', () => {
  beforeEach(() => {
    cy.visit('/partner/hours');
  });

  it('should display current hours', () => {
    cy.get('[data-testid="hours-table"]').should('exist');
  });

  it('should update hours', () => {
    cy.get('[data-testid="monday-open"]').clear().type('08:00');
    cy.get('[data-testid="save-hours"]').click();
    cy.get('[data-testid="success-message"]').should('exist');
  });
});

describe('Delivery Zones', () => {
  beforeEach(() => {
    cy.visit('/partner/zones');
  });

  it('should display zones list', () => {
    cy.get('[data-testid="zones-list"]').should('exist');
  });

  it('should add new zone', () => {
    cy.get('[data-testid="add-zone"]').click();
    cy.get('[data-testid="zone-name"]').type('Downtown');
    cy.get('[data-testid="save-zone"]').click();
    cy.get('[data-testid="success-message"]').should('exist');
  });
});