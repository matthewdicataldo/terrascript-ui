# **Terrascript UI - Testing Plan**

## **1. Introduction**

This document outlines the testing strategy for the Terrascript UI project. The goal is to ensure the application is reliable, functional, and provides a good user experience, particularly focusing on its core features of LLM-driven chat and map interactions. This plan covers different levels of testing, focusing on unit/component tests using Vitest and end-to-end (E2E) tests using Playwright.

## **2. Testing Scope**

### **In Scope:**

* **Core UI Components:** All reusable UI components in src/lib/components/ui/ will be tested for rendering, props, events, and basic interactions.  
* **Map Component(s):** Specific tests for the map display and its basic functionalities.  
* **Chat Component(s):** Specific tests for the chat interface, message display, input handling, and streaming updates.  
* **Utility Functions:** Functions within src/lib/utils.ts and other helper modules.  
* **Svelte Stores & Hooks:** Custom Svelte stores (e.g., $state from Svelte 5 Runes like in is-mobile.svelte.ts) and context-based logic (e.g., sidebar/context.svelte.ts).  
* **Client-Side Logic:**  
  * WebSocket communication for LLM chat streaming (src/lib/client/db.ts or relevant modules).  
  * Interaction with the Gemini LLM (via server).  
  * State management for chat and map.  
* **Server-Side Logic (Unit/Integration):**  
  * Key parts of server-side handlers (src/hooks.server.ts).  
  * WebSocket handler (src/lib/server/webSocketHandler.ts) for LLM chat streaming, including communication with the Gemini API.  
  * Any other backend endpoints supporting client functionalities.  
* **Key User Flows (E2E):**  
  * User interacting with the LLM chat (sending messages, receiving streamed responses).  
  * User viewing and interacting with the map.  
  * (Future) LLM drawing on the map based on chat interactions.  
  * Navigation between different sections/views.  
  * Form submissions (if any beyond chat input).  
  * (Future) Authentication flows, once implemented.  
* **Responsive Design:** Basic checks for responsiveness across different viewport sizes using Playwright.  
* **API Interactions (E2E):** Ensuring the frontend correctly interacts with the backend WebSocket endpoints and any other HTTP APIs for LLM and map functionalities.

### **Out of Scope (Initially, can be added later):**

* Exhaustive performance testing (beyond basic responsiveness of chat streaming).  
* Security penetration testing (beyond basic input validation).  
* Usability testing with real users (this plan focuses on automated functional tests).  
* Testing of third-party library internals (e.g., detailed testing of the map library itself, or Gemini API internals).  
* Database schema migration testing (Drizzle migrations are assumed to be correct, though their effect on the app will be tested).

## **3. Testing Levels & Tools**

* **Unit & Component Tests:**  
  * **Tool:** Vitest  
  * **Focus:** Testing individual functions, Svelte components (including map and chat components) in isolation, and small modules.  
  * **Location:** Tests will typically reside alongside the code they test (e.g., \*.test.ts or \*.spec.ts files) or in a centralized \_\_tests\_\_ directory.  
* **End-to-End (E2E) Tests:**  
  * **Tool:** Playwright  
  * **Focus:** Simulating real user scenarios by interacting with the application through the browser. Testing complete flows like LLM chat sessions and map interactions.  
  * **Location:** E2E tests will be in a dedicated tests/e2e or playwright/tests directory.

## **4. Vitest Test Plan (Unit & Component Tests)**

### **4.1. Setup and Configuration**

* Ensure Vitest is configured correctly in vite.config.ts.  
* Set up Svelte Testing Library (or equivalent) for component testing.  
* Configure test environment, including any necessary global setups or mocks (e.g., for browser APIs, WebSocket client, Gemini API client).

### **4.2. Areas to Test:**

* **UI Components (src/lib/components/ui/):**  
  * **Breadcrumb, Button, Input, Separator, Sheet, Sidebar, Skeleton, Textarea, Tooltip:** Test as previously defined (rendering, props, events, states, accessibility).  
  * **Map Component(s):** Test initial rendering, prop handling (e.g., initial coordinates, zoom), basic event emission if any (e.g., map loaded).  
  * **Chat Component(s):** Test message list rendering, handling of user input, display of streamed messages, loading states, error states.  
* **Utility Functions (src/lib/utils.ts):**  
  * Test each utility function with various inputs, including edge cases and invalid inputs.  
* **Svelte Stores/Runes & Contexts:**  
  * src/lib/hooks/is-mobile.svelte.ts: Test logic for determining mobile state.  
  * src/lib/components/ui/sidebar/context.svelte.ts: Test context provider and consumer logic.  
* **Client-Side Logic (e.g., src/lib/client/db.ts, chat/map specific modules):**  
  * Test functions responsible for WebSocket connection setup, message sending (to LLM backend), and handling of incoming streamed messages.  
  * Mock the WebSocket client to verify correct message formatting, event handling (open, message, error, close), and state updates.  
  * Test error handling for WebSocket communication.  
* **Server-Side Logic (Unit/Integration):**  
  * src/hooks.server.ts: Test individual hook functions, mocking event objects and any external services.  
  * src/lib/server/webSocketHandler.ts:  
    * Test WebSocket connection handling, message parsing from client.  
    * Test logic for interacting with the Gemini API (request formatting, response handling, error handling). Mock the Gemini API client.  
    * Test logic for streaming Gemini responses back to the client.  
    * Test interactions with other server modules (e.g., database if chat history is stored).  
  * Database interactions (src/lib/server/db/schema.ts, src/lib/server/db/index.ts): While Drizzle handles query building, test any custom data transformation or business logic layer built on top of it (e.g., for storing chat history if applicable). Mock the Drizzle client or database connection.

### **4.3. Mocking Strategy**

* Utilize Vitest's mocking capabilities (vi.mock, vi.fn, vi.spyOn).  
* Mock external dependencies:  
  * fetch API for any standard network requests.  
  * WebSocket server/client instances.  
  * Gemini API client/SDK.  
  * Database clients (e.g., Drizzle client).  
  * Browser-specific APIs (e.g., window.matchMedia).  
  * SvelteKit modules ($app/environment, $app/stores) where necessary.  
* Create reusable mocks in a \_\_mocks\_\_ directory if applicable.

### **4.4. Test Coverage Goals**

* Aim for a high level of unit/component test coverage (e.g., \>80%) for critical business logic (LLM chat, map interactions), UI components, and utility functions.  
* Use Vitest's coverage reporting tools to track progress.

## **5. Playwright Test Plan (End-to-End Tests)**

### **5.1. Setup and Configuration**

* Install and configure Playwright.  
* Define base URL and other environment configurations.  
* Set up playwright.config.ts for different browsers, viewport sizes.  
* Implement a strategy for running the SvelteKit dev server or a production build before tests.  
* Consider mocking the Gemini API at the network level for Playwright tests to ensure consistent and fast responses, and to avoid actual API costs/quotas during testing. This can be done using Playwright's network interception features (page.route).

### **5.2. Key User Flows to Test:**

* **LLM Chat Interaction:**  
  * User opens the chat interface.  
  * User types and sends a message/prompt.  
  * Verify the message appears in the chat history.  
  * Verify loading indicator appears while waiting for LLM.  
  * Verify the LLM response is streamed and displayed progressively and accurately in the chat UI.  
  * Test sending multiple messages and maintaining conversation context (if applicable).  
  * Test handling of potential errors from the LLM (e.g., display friendly error message).  
  * Test chat input clearing after sending.  
* **Map Display & Basic Interaction:**  
  * Verify the map loads correctly on the page.  
  * Verify any default markers or layers are displayed.  
  * (If basic interactions exist) Test zooming, panning.  
* **(Future) LLM Drawing on Map:**  
  * User asks LLM to draw something on the map (e.g., "Show me the capital of France").  
  * Verify the map updates with the requested drawing/marker.  
* **Navigation:**  
  * Navigate through main pages/views using sidebar/header links.  
  * Test breadcrumb navigation (if still used).  
  * Verify correct page content loads for chat and map views.  
* **(Future - When Implemented) Authentication:**  
  * User login with valid/invalid credentials.  
  * User logout.  
  * Session persistence/expiry.  
  * Access control for protected routes/features.  
* **Responsive Design Checks:**  
  * Load chat and map views on different viewport sizes (desktop, tablet, mobile).  
  * Verify layout adjusts correctly (e.g., chat panel, map controls).  
  * Ensure no horizontal scrolling or major UI breakages.  
* **Error Handling (General):**  
  * Test scenarios that should result in user-facing error messages (e.g., WebSocket connection failure, unhandled server errors).  
  * Verify error messages are displayed clearly.

### **5.3. Page Object Model (POM) Strategy**

* Implement the Page Object Model.  
* Create page classes/objects for:  
  * ChatPage (or ChatComponent if it's part of a larger page)  
  * MapPage (or MapComponent)  
  * (Future) LoginPage  
* Page objects will encapsulate selectors and methods for interacting with elements.

### **5.4. Cross-browser/Cross-device Testing**

* Run E2E tests across major browsers (Chromium, Firefox, WebKit).  
* Emulate common mobile devices or use defined mobile viewports.

### **5.5. Test Data Management**

* **LLM Prompts:** Prepare a set of standard prompts for testing chat functionality, including some that might test edge cases or specific desired behaviors.  
* **Mocked LLM Responses:** For deterministic E2E tests, define mocked LLM responses (including streamed chunks) that Playwright can serve when the Gemini API is intercepted.  
* **Seeding:** If chat history or map configurations are stored and affect tests, consider seeding mechanisms.  
* **Isolation:** Ensure tests are isolated.

## **6. Test Execution & Reporting**

* **Local Execution:** Scripts in package.json (e.g., npm run test:unit, npm run test:e2e).  
* **CI/CD Integration:** Integrate into CI/CD pipeline (e.g., GitHub Actions).  
* **Reporting:** Use Vitest and Playwright built-in reporting, integrate with CI.

## **7. Roles and Responsibilities (Optional)**

* **Developers:** Write unit, component, and E2E tests for their features.

## **8. Open Questions / Considerations for Terrascript UI**

* **Primary User Roles:** Currently none (no authentication). This will be a consideration when auth is added.  
* **Critical User Flows:**  
  1. User engages in a chat conversation with the LLM, receiving streamed responses.  
  2. User views information/drawings on the map.  
  3. (Future) User asks LLM to interact with/draw on the map.  
* **High-Risk Areas:**  
  * LLM chat integration (streaming, context, error handling).  
  * (Future) Connection between LLM instructions and map drawing.  
* **Authentication:** Planned for the future. Testing strategy will need to be updated then.  
* **WebSocket Interactions:** Primarily for streaming LLM data. Test for robustness, correct message handling, and graceful degradation on errors.  
* **Performance Benchmarks:** For LLM chat, perceived performance (time to first token, smooth streaming) is important. While not formal benchmarks, E2E tests can give an indication.  
* **Third-party Integrations:**  
  * Gemini API: Requires careful mocking for consistent testing and to manage API usage/costs.  
  * Map Library: Ensure basic functionality and integration points are tested.

## **9. Testing Plan Checklist**

### **9.1. General Setup**

* [ ] Configure Vitest in vite.config.ts.  
* [ ] Set up Svelte Testing Library (or equivalent).  
* [ ] Configure Playwright (playwright.config.ts) including base URL, browsers, viewports.  
* [ ] Implement strategy for running SvelteKit dev server/build for Playwright tests.  
* [ ] Add test scripts to package.json (test:unit, test:e2e).  
* [ ] Set up CI/CD integration for automated testing.

### **9.2. Vitest - Unit & Component Tests**

* **UI Components (src/lib/components/ui/)**  
  * [ ] Breadcrumb: rendering, links, separators, active states.  
  * [ ] Button: variants, sizes, states, click events.  
  * [ ] Input: value binding, types, placeholder, states, events.  
  * [ ] Separator: rendering, orientations.  
  * [ ] Sheet: open/close, content, side variations.  
  * [ ] Sidebar: items, navigation, active states, context.  
  * [ ] Skeleton: rendering, shapes/sizes.  
  * [ ] Textarea: value binding, placeholder, states, events.  
  * [ ] Tooltip: trigger, content display.  
  * [ ] General: Accessibility (ARIA, keyboard nav) for all applicable UI components.  
* **Application-Specific Components**  
  * [ ] Map Component(s): initial rendering, props, basic events.  
  * [ ] Chat Component(s): message list rendering, user input, streamed message display, loading/error states.  
* **Utility Functions (src/lib/utils.ts)**  
  * [ ] Test each utility function with various inputs and edge cases.  
* **Svelte Stores/Runes & Contexts**  
  * [ ] is-mobile.svelte.ts: logic for mobile state detection (mock browser env).  
  * [ ] sidebar/context.svelte.ts: provider/consumer logic, defaults, updates.  
* **Client-Side Logic (WebSocket, LLM interaction)**  
  * [ ] WebSocket connection setup.  
  * [ ] Sending messages via WebSocket.  
  * [ ] Handling incoming streamed messages (parsing, state updates).  
  * [ ] Mock WebSocket client for testing message formats and event handling.  
  * [ ] Error handling for WebSocket communication.  
* **Server-Side Logic (Unit/Integration)**  
  * [ ] hooks.server.ts: Test individual hook functions (mock events, services).  
  * [ ] webSocketHandler.ts:  
    * [ ] WebSocket connection handling.  
    * [ ] Client message parsing.  
    * [ ] Gemini API interaction logic (mock Gemini client).  
      * [ ] Request formatting to Gemini.  
      * [ ] Handling responses from Gemini (success, errors).  
    * [ ] Streaming Gemini responses to client.  
    * [ ] (If applicable) Interaction with database (e.g., for chat history - mock Drizzle).  
  * [ ] Database interactions (src/lib/server/db/): Test custom logic on top of Drizzle (mock Drizzle).

### **9.3. Playwright - End-to-End Tests**

* **Setup**  
  * [ ] Implement Page Object Model (POM) for ChatPage, MapPage.  
  * [ ] (Future) POM for LoginPage.  
  * [ ] Set up network interception for mocking Gemini API responses.  
  * [ ] Define test data (LLM prompts, mocked LLM responses).  
* **LLM Chat Interaction**  
  * [ ] Open chat interface.  
  * [ ] Send a message/prompt.  
  * [ ] Verify message in history.  
  * [ ] Verify loading indicator.  
  * [ ] Verify LLM response is streamed and displayed correctly.  
  * [ ] Test multiple messages / conversation context (if applicable).  
  * [ ] Test LLM error handling (display friendly message).  
  * [ ] Test chat input clearing.  
* **Map Display & Basic Interaction**  
  * [ ] Verify map loads correctly.  
  * [ ] Verify default markers/layers.  
  * [ ] Test zoom/pan (if interactive).  
* **(Future) LLM Drawing on Map**  
  * [ ] User asks LLM to draw on map.  
  * [ ] Verify map updates correctly.  
* **Navigation**  
  * [ ] Navigate between main views (chat, map) using UI elements.  
  * [ ] Verify correct page content for each view.  
* **(Future - When Implemented) Authentication**  
  * [ ] Login (valid/invalid).  
  * [ ] Logout.  
  * [ ] Session management.  
  * [ ] Access control.  
* **Responsive Design**  
  * [ ] Test chat and map views on desktop, tablet, mobile viewports.  
  * [ ] Verify layout adjustments and no major UI breakages.  
* **General Error Handling**  
  * [ ] Test WebSocket connection failures.  
  * [ ] Test unhandled server error scenarios.  
  * [ ] Verify clear error messages.

### **9.4. Test Maintenance & Reporting**

* [ ] Regularly review and update tests as features evolve.  
* [ ] Monitor test coverage reports.  
* [ ] Ensure CI/CD reports for Vitest (including coverage) and Playwright (HTML reports with traces) are accessible.