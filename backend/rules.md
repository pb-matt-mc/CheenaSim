# PocketBase Collection Rules

Rules are stored inside PocketBase's SQLite — this file documents them for reproducibility.

## positions

| Rule   | Value |
|--------|-------|
| list   | `@request.auth.id = record.user \|\| @request.auth.id = record.user.partner` |
| view   | `@request.auth.id = record.user \|\| @request.auth.id = record.user.partner` |
| create | `@request.auth.id = @request.data.user` |
| update | `@request.auth.id = record.user` |
| delete | *(locked — no delete)* |

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
