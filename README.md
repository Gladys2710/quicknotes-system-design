# QuickNotes — System Design

QuickNotes is a lightweight web application and comprehensive system design for note-taking and management. The frontend interacts with a RESTful API to support asynchronous note retrieval, client-side validation, note creation, and deletion with resilient error handling and UI state synchronization. The accompanying architecture documentation details a scalable, high-availability distributed backend system designed to serve over one million daily active users.

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Gladys2710/quicknotes-system-design.git
   ```
2. Navigate to the project directory:
   ```bash
   cd quicknotes-system-design
   ```
3. Open `index.html` directly in any modern web browser, or serve it using an extension like VS Code's **Live Server** or a local HTTP server:
   ```bash
   npx serve .
   ```
4. Click **Load notes** to fetch notes from the server.
5. Use the form to enter a note title and body, then click **Add note** to prepend a new note to the top of the list.
6. Click the **Delete** button on any note to remove it.

## Documents

Explore the system design and technical specifications:
- [API Design](docs/api-design.md) — RESTful endpoints, request/response JSON payloads, and HTTP error code standards.
- [Data Model](docs/data-model.md) — Relational database schema, PostgreSQL DDL, junction tables, indexes, and queries.
- [Architecture](docs/architecture.md) — System architecture diagram, capacity planning, request lifecycles, and trade-off mitigations.

## What I Learned

- **Resilient UI State Management:** Using `async`/`await` paired with structured `try`/`catch`/`finally` blocks ensures interactive controls (such as submit and delete buttons) are disabled during pending network requests and reliably re-enabled in `finally` blocks regardless of outcome.
- **RESTful API Standards & Status Codes:** Why standardized HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`) and predictable error response structures matter for building robust client-server contracts.
- **XSS Prevention in Dynamic DOM Rendering:** Using safe DOM manipulation (`textContent` and `document.createTextNode`) instead of `innerHTML` when rendering user-supplied strings prevents Cross-Site Scripting (XSS) attacks.
- **High-Scale System Architecture:** How read replicas, multi-layer caching with Redis, and asynchronous message queues with background workers decouple heavy workloads and scale read-heavy applications while eliminating single points of failure (SPOF).
