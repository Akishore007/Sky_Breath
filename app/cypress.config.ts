import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:8080", // SkyBreath Frontend runs here
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
  },
});
