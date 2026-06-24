# PocketBase Collection Rules

Rules are stored inside PocketBase's SQLite — this file documents them for reproducibility.

## positions

> **Note (PB 0.22):** Two-level relation traversal (`record.user.partner`) is broken in PocketBase 0.22 —
> it causes a 400 on list/view. Simplified rules to `@request.auth.id != ""` (any authenticated user).
> Safe for this system because there are exactly two users and they share all records by design.

| Rule   | Value |
|--------|-------|
| list   | `@request.auth.id != ""` |
| view   | `@request.auth.id != ""` |
| create | `@request.auth.id != ""` |
| update | `@request.auth.id != ""` |
| delete | *(locked — null)* |

## history

| Rule   | Value |
|--------|-------|
| list   | `@request.auth.id = record.user \|\| @request.auth.id = record.user.partner` |
| view   | `@request.auth.id = record.user \|\| @request.auth.id = record.user.partner` |
| create | `@request.auth.id = @request.data.user` |
| update | *(locked — append-only)* |
| delete | *(locked)* |

## interactions

| Rule   | Value |
|--------|-------|
| list   | `@request.auth.id = record.sender \|\| @request.auth.id = record.sender.partner` |
| view   | `@request.auth.id = record.sender \|\| @request.auth.id = record.sender.partner` |
| create | `@request.auth.id = @request.data.sender` |
| update | *(locked)* |
| delete | *(locked)* |

## users (Auth collection)

Default PocketBase auth rules apply. The `partner` relation field is self-referential.
