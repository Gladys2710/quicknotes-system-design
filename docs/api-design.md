# QuickNotes API Design

This document details the RESTful API design for the QuickNotes application, including endpoints, request/response structures, status codes, and error formats.

---

## Endpoints

| Method | Path | Description | Success |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a user | `201` |
| `POST` | `/auth/login` | Log in, returns token | `200` |
| `GET` | `/notes` | List user's notes (paginated) | `200` |
| `POST` | `/notes` | Create a note | `201` |
| `GET` | `/notes/{id}` | Get one note | `200` |
| `PATCH` | `/notes/{id}` | Update a note | `200` |
| `DELETE` | `/notes/{id}` | Delete a note | `204` |
| `GET` | `/tags` | List tags | `200` |

---

## JSON Examples

### 1. Create a Note (`POST /notes`)

#### Request Body
```json
{
  "title": "Meeting Notes",
  "body": "Discussed system architecture and API endpoints for QuickNotes.",
  "tags": ["work", "architecture"]
}
```

#### Response (`201 Created`)
```json
{
  "id": 101,
  "title": "Meeting Notes",
  "body": "Discussed system architecture and API endpoints for QuickNotes.",
  "tags": ["work", "architecture"],
  "userId": 1,
  "createdAt": "2026-10-21T14:30:00Z",
  "updatedAt": "2026-10-21T14:30:00Z"
}
```

---

### 2. List Notes (`GET /notes`)

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "title": "Meeting Notes",
    "body": "Discussed system architecture and API endpoints for QuickNotes.",
    "tags": ["work", "architecture"],
    "userId": 1,
    "createdAt": "2026-10-21T14:30:00Z",
    "updatedAt": "2026-10-21T14:30:00Z"
  },
  {
    "id": 2,
    "title": "Grocery List",
    "body": "Milk, eggs, sourdough bread, and coffee beans.",
    "tags": ["personal", "shopping"],
    "userId": 1,
    "createdAt": "2026-10-21T15:00:00Z",
    "updatedAt": "2026-10-21T15:00:00Z"
  }
]
```

---

## Error Codes

| Status Code | Description / Returned When |
| :--- | :--- |
| `400` | Bad Request — Returned when the request payload is malformed or validation fails (e.g. title is empty or exceeds character limits). |
| `401` | Unauthorized — Returned when authentication credentials are missing, invalid, or expired. |
| `403` | Forbidden — Returned when an authenticated user attempts to access or modify a note they do not own. |
| `404` | Not Found — Returned when the requested resource (e.g. note ID or endpoint) does not exist. |
| `500` | Internal Server Error — Returned when an unexpected error occurs on the server while processing the request. |

### Example Error Response Body

```json
{
  "error": {
    "code": "TITLE_REQUIRED",
    "message": "The title field is required."
  }
}
```
