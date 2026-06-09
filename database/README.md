# Database README

This document describes the Ames Events database structure, setup process and operational notes.

## Database Engine

The project uses MySQL or MariaDB with:

- InnoDB tables;
- `utf8mb4` character set;
- `utf8mb4_unicode_ci` collation;
- foreign keys for referential integrity.

Recommended database creation:

```sql
CREATE DATABASE ames_events
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## SQL Files

Database files are stored in:

```text
database/
```

Main files:

- `schema.sql`: full database structure.
- `seed.sql`: initial test data.

Import order:

```bash
mysql -u root -p ames_events < database/schema.sql
mysql -u root -p ames_events < database/seed.sql
```

## Main Tables

The database includes these main tables:

- `roles`
- `users`
- `events`
- `categories`
- `locations`
- `audiences`
- `organizers`
- `favorites`
- `alerts`
- `content_manager_requests`

## Roles

`roles` defines application permissions.

Seed roles:

- `admin`
- `user`
- `content_manager`

Application logic should rely on role names, not fixed role IDs.

## Users

`users` stores registered accounts.

Important fields:

- `id`
- `role_id`
- `username`
- `email`
- `password_hash`
- `is_active`
- `email_verified`
- `email_verification_token`
- `verification_expires_at`
- `password_reset_token`
- `password_reset_expires_at`

Security notes:

- Passwords are stored as bcrypt hashes.
- Password hashes must never be returned by API responses.
- Verification and reset tokens must not be exposed.
- Login is blocked for non-verified or inactive accounts.

## Events

`events` is the central table of the application.

Important fields:

- `title`
- `description`
- `category_id`
- `location_id`
- `audience_id`
- `organizer_id`
- `event_date`
- `is_free`
- `price`
- `image_url`

Rules:

- `title` is required.
- `category_id` and `location_id` are required.
- `price` is `NULL` for free events.
- paid events require a price greater than zero.
- `event_date` uses MySQL `DATETIME`.

`event_date` is treated as a local event datetime, not as a UTC instant. The backend reads MySQL `DATE` and `DATETIME` values as strings to avoid timezone shifts between local development and hosting.

## Catalog Tables

### Categories

`categories` classifies events and can provide fallback images.

Fields:

- `id`
- `name`
- `image_url`

### Locations

`locations` stores places where events happen.

Fields:

- `id`
- `name`
- `locality`
- `lat`
- `lng`

Locations power the map and locality filters.

### Audiences

`audiences` describes target age groups.

Fields:

- `id`
- `name`
- `age_min`
- `age_max`

### Organizers

`organizers` stores event organizer information.

Fields:

- `id`
- `name`
- `email`
- `phone`

## Favorites

`favorites` stores the many-to-many relation between users and events.

Key details:

- composite primary key: `(user_id, event_id)`;
- prevents duplicate favorites;
- cascades when a user or event is deleted.

Favorites are used by:

- the favorites page;
- favorite counters;
- reminder email selection when the CLI reminder script is executed.

## Alerts

`alerts` stores notification rules created by users.

Fields:

- `user_id`
- `name`
- `category_id`
- `location_id`
- `locality`
- `audience_id`
- `keyword`
- `is_active`

An alert must have at least one criterion besides its name.

When a new event is created, the backend compares it with active alerts. Matching users can receive email notifications if their account is active and verified.

## Content Manager Requests

`content_manager_requests` stores requests from regular users who want publishing permissions.

Fields:

- `user_id`
- `phone`
- `organization_name`
- `proposal_title`
- `proposal_description`
- `status`
- `admin_notes`
- `reviewed_by`
- `reviewed_at`

Allowed statuses:

- `pending`
- `approved`
- `rejected`

When a request is created, the backend can notify admins by email using the request data; no separate notification table is used for this flow. When an admin approves a request, the backend updates the request and changes the user role to `content_manager` in a transaction.

## Seed Data

`database/seed.sql` provides test data for local development.

Seed users share this password:

```text
tfg2026
```

Main seed accounts:

| Username | Email | Role |
|---|---|---|
| `admin` | `admin@example.com` | `admin` |
| `usuario` | `usuario@example.com` | `user` |
| `gestor` | `gestor@example.com` | `content_manager` |
| `familia` | `familia@example.com` | `user` |
| `vecina` | `vecina@example.com` | `user` |
| `deporte` | `deporte@example.com` | `user` |
| `cultura` | `cultura@example.com` | `user` |

## Backups

Create a backup:

```bash
mysqldump -u root -p ames_events > backup_ames_events.sql
```

Restore a backup:

```bash
mysql -u root -p ames_events < backup_ames_events.sql
```

For production, run backups regularly and store them outside the public web root.

## Operational Notes

- Keep `schema.sql` synchronized with the current database structure.
- Keep seed data free of real user credentials.
- Do not commit production dumps containing personal data.
- Do not expose password hashes, reset tokens or verification tokens.
- Use `utf8mb4` to avoid character problems with Spanish and Galician text.
- Check foreign key constraints before deleting catalog records used by events.

## Troubleshooting

### Access Denied

Check:

- database name;
- database user;
- database password;
- user privileges;
- hidden characters in `.env` values.

### Missing Tables

Re-run `schema.sql` on a clean database. Do not import `seed.sql` before `schema.sql`.

### Character Encoding Problems

Verify:

```sql
SELECT @@character_set_database, @@collation_database;
```

Expected:

```text
utf8mb4
utf8mb4_unicode_ci
```

### Event Time Shift

`events.event_date` is a `DATETIME` and should be handled as local event time. The backend MySQL connection uses `dateStrings` for `DATE` and `DATETIME` fields to prevent unwanted timezone conversion.
