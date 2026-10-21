# QuickNotes Data Model

This document outlines the database design, schema definitions, relationships, indexes, example queries, and architectural considerations for QuickNotes using PostgreSQL.

---

## Entity Tables

### `users`
| Column | Type | PK | FK | Constraints / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | Yes | No | Primary key, auto-incrementing integer |
| `email` | `VARCHAR(255)` | No | No | `UNIQUE NOT NULL` |
| `password_hash` | `TEXT` | No | No | `NOT NULL`, securely hashed password |
| `created_at` | `TIMESTAMPTZ` | No | No | `DEFAULT now()` |

### `notes`
| Column | Type | PK | FK | Constraints / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | Yes | No | Primary key, auto-incrementing integer |
| `user_id` | `INT` | No | Yes (`users.id`) | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `title` | `VARCHAR(100)` | No | No | `NOT NULL`, max length 100 characters |
| `body` | `TEXT` | No | No | Nullable, note body content |
| `created_at` | `TIMESTAMPTZ` | No | No | `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | No | No | `DEFAULT now()` |

### `tags`
| Column | Type | PK | FK | Constraints / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | Yes | No | Primary key, auto-incrementing integer |
| `user_id` | `INT` | No | Yes (`users.id`) | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `name` | `VARCHAR(50)` | No | No | `NOT NULL`, tag identifier |
| *(composite)* | — | — | — | `UNIQUE (user_id, name)` |

### `note_tags`
| Column | Type | PK | FK | Constraints / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `note_id` | `INT` | Yes (Composite) | Yes (`notes.id`) | `NOT NULL REFERENCES notes(id) ON DELETE CASCADE` |
| `tag_id` | `INT` | Yes (Composite) | Yes (`tags.id`) | `NOT NULL REFERENCES tags(id) ON DELETE CASCADE` |
| *(composite)* | — | Yes | — | `PRIMARY KEY (note_id, tag_id)` |

---

## Relationships

One user has many notes (one user → many notes via foreign key `notes.user_id` referencing `users.id`). Similarly, one user has many tags via foreign key `tags.user_id` referencing `users.id`. Notes and tags have a many-to-many relationship (many notes ↔ many tags) modeled through the `note_tags` junction table. Cascading deletes (`ON DELETE CASCADE`) guarantee referential integrity so that deleting a user removes all their notes and tags, and deleting a note removes its associated tag associations in `note_tags`.

---

## PostgreSQL DDL (CREATE TABLE Statements)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
  note_id INT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

---

## Example Queries

### 1. All notes for a user with their tags (JOIN)
```sql
SELECT n.id, n.title, t.name AS tag
FROM notes n
LEFT JOIN note_tags nt ON nt.note_id = n.id
LEFT JOIN tags t ON t.id = nt.tag_id
WHERE n.user_id = $1;
```

### 2. Search a user's notes
```sql
SELECT * FROM notes WHERE user_id = $1 AND title ILIKE '%' || $2 || '%';
```

### 3. Most recent 20 notes for the feed
```sql
SELECT id, title, body, created_at FROM notes
WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20;
```

---

## Indexes

```sql
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
```

**Reason:** Every list query filters by `user_id` and sorts by `created_at`, so this composite index avoids a scan and sort.

---

## Database Choice: SQL vs NoSQL

We choose a relational database (SQL / PostgreSQL) over NoSQL because the QuickNotes application inherently features relational data with joins across notes and tags. PostgreSQL provides strong consistency and ACID transactions, which are essential for user authentication, data integrity, and synchronized updates across junction tables. Furthermore, relational databases provide established, predictable scaling patterns through read replicas and connection pooling, ensuring high read performance as the user base grows.
