# Admin Manual

## Introduction

This manual describes the administration and content management workflows in Ames Events.

The application uses three main roles:

- `user`: browses events, manages favorites and alerts, edits their profile and can request content manager access.
- `content_manager`: creates and edits events and manages the catalogs needed to publish event information.
- `admin`: full access, including user management, request review, catalog administration and event deletion.

## Admin Access

Administrators log in from `/login` using an account with role `admin`.

After login, admin-only or manager-only sections become available in the interface.

Main administration routes:

- `/events`: event management from the event list.
- `/events/new`: create event.
- `/events/:id/edit`: edit event.
- `/categories`: category catalog.
- `/locations`: location catalog.
- `/organizers`: organizer catalog.
- `/audiences`: audience catalog, admin only.
- `/admin/users`: user management and content manager request review, admin only.

## Event Management

Admins and content managers can create, edit and duplicate events. Only admins can delete events.

### Create an Event

1. Open `/events/new`.
2. Fill in the event form:
   - title;
   - date and time;
   - description;
   - image, optional;
   - free or paid type;
   - price, required for paid events;
   - audience, optional;
   - organizer, optional;
   - category;
   - location.
3. Submit the form.

Required fields:

- title;
- category;
- location;
- price when the event is paid.

The backend validates relationships, permissions, image upload and event payload before saving.

### Upload Event Images

Event images are uploaded through the event form.

The backend processes uploaded images with Sharp:

- crops to 16:9;
- resizes to 900x506;
- stores as WebP.

If no image is provided, the frontend uses the category fallback image or the generic fallback.

### Edit an Event

1. Open the event detail or list.
2. Select the edit action.
3. Update the fields.
4. Save changes.

Event date and time are treated as local event datetimes to avoid timezone shifts between local development and hosting.

### Duplicate an Event

Admins and content managers can duplicate an existing event to reuse its data.

When duplicating, select a new date before saving the duplicate.

### Delete an Event

Only admins can delete events.

Deletion removes the event record and associated data affected by database constraints. Uploaded event image files are also cleaned up by the backend when appropriate.

## Category Management

Route:

```text
/categories
```

Permissions:

- view: public through API;
- create/edit: `admin`, `content_manager`;
- delete: `admin`.

Categories are used to classify events and provide fallback images.

Category fields include:

- name;
- optional image.

## Location Management

Route:

```text
/locations
```

Permissions:

- view: public through API;
- create/edit: `admin`, `content_manager`;
- delete: `admin`.

Locations include:

- name;
- locality;
- latitude;
- longitude.

Locations power the event map and locality filters.

## Organizer Management

Route:

```text
/organizers
```

Permissions:

- view: public through API;
- create/edit: `admin`, `content_manager`;
- delete: `admin`.

Organizers can be attached to events to identify the entity responsible for the activity.

## Audience Management

Route:

```text
/audiences
```

Permissions:

- view: public through API;
- create/edit/delete: `admin`.

Audiences describe the target public for events, usually by age range.

Audience fields:

- name;
- minimum age, optional depending on range type;
- maximum age, optional depending on range type.

## User Management

Route:

```text
/admin/users
```

Backend API route:

```text
/users
```

Permissions:

- `admin` only.

Admins can:

- list users;
- inspect user details;
- change user roles;
- activate or deactivate accounts;
- review content manager requests.

Safety rules:

- an admin cannot remove their own admin role;
- an admin cannot deactivate their own account;
- invalid roles cannot be assigned;
- password hashes and verification tokens are not returned by the API.

## Content Manager Requests

Users can request publishing permissions from `/propose-event`.

Admins review requests from the admin user panel.

Possible request states:

- `pending`;
- `approved`;
- `rejected`.

When a request is approved:

- the request changes to `approved`;
- the user role changes to `content_manager`;
- the user gains access to event creation and catalog management routes.

When a request is rejected:

- the request changes to `rejected`;
- the user keeps the `user` role;
- admin notes can explain the decision.

## Alerts and Email Notifications

Users can create alerts based on category, locality, audience or keyword.

When a new event is created, the backend checks active alerts. If an alert matches and the user account is active and verified, an email notification can be sent.

Email delivery requires SMTP configuration in `backend/.env`.

## Favorite Reminder Emails

Favorite reminders are sent by a CLI script:

```bash
cd backend
npm run send:favorite-reminders
```

By default, the script processes events scheduled for tomorrow.

To process a specific date:

```bash
npm run send:favorite-reminders -- 2026-05-20
```

In hosting, use cron to execute the CLI script directly. The backend does not send favorite reminders during startup.

Example cron command:

```bash
cd /home/your-user/api && /path/to/node scripts/sendFavoriteReminders.js >> /home/your-user/api/scripts/cron_reminders.log 2>&1
```

The script reports:

- `Revisados`: matching reminders checked;
- `Enviados`: emails accepted by the mail transport;
- `Omitidos`: reminders not delivered without a fatal exception;
- `Fallidos`: reminders that raised an error.

## Environment Variables

Main backend variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ames_events
DB_PORT=3306
JWT_SECRET=change-this-in-production
APP_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
PORT=3001
```

Email variables:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM="Ames Events <no-reply@ames-events.local>"
```

Upload variables for hosting:

```env
EVENT_IMAGES_DIR=/home/your-user/api/uploads/events
EVENT_IMAGES_PUBLIC_BASE_URL=https://api.example.com
CATEGORY_IMAGES_DIR=/home/your-user/api/uploads/categories
CATEGORY_IMAGES_PUBLIC_BASE_URL=https://api.example.com
```

## Operational Checks

### Run Backend Tests

```bash
cd backend
npm test
```

### Check API Health

```text
GET /
```

Expected response:

```text
API Ames Events funcionando
```

### Check Database Access

If the backend cannot start or scripts fail, verify:

- database host;
- database username;
- database password;
- database name;
- database user permissions.

### Check Email Delivery

If emails are not received:

- verify SMTP variables;
- check spam folders;
- review backend logs;
- review reminder cron logs if applicable.

## Recommended Production Practices

- Use a strong `JWT_SECRET`.
- Keep `.env` files out of Git.
- Program reminder emails with cron only when they should be sent automatically.
- Restrict CORS to the real frontend domain.
- Ensure upload directories are writable by the Node.js process.
- Run tests before deployment.
- Build the frontend with the production API URL configured.
