describe("SkyBreath Weather App E2E Tests", () => {
  beforeEach(() => {
    // Optional: Intercept API calls to prevent rate-limiting during testing
    // cy.intercept("GET", "/api/v1/weather/*").as("weatherData");
    cy.visit("/");
  });

  it("should load the application correctly", () => {
    // Ensure the main layout loads
    cy.get("body").should("be.visible");
    cy.contains(/SkyBreath/i).should("exist");
  });

  it("should perform a weather search", () => {
    // Locate the search input (assumes an input exists with placeholder like "search")
    cy.get('input[type="text"]')
      .first()
      .should("be.visible")
      .type("London{enter}");

    // Wait for weather data to load
    // cy.wait("@weatherData");

    // The city name should appear in the results
    cy.contains(/London/i).should("exist");
  });

  it("should render error for invalid city", () => {
    cy.get('input[type="text"]')
      .first()
      .clear()
      .type("InvalidCityNameXYZ123{enter}");
    
    // An error toast or message should appear
    cy.contains(/(not found|error)/i).should("exist");
  });
});
