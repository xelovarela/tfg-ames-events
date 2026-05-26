# Deployment Notes

This document summarizes the recommended production deployment for Ames Events.

## Target Architecture

Production is split into two public surfaces:

- Frontend: static React build served from the main domain.
- Backend: Express API served from a separate API domain or subdomain.

Typical layout:

```text
https://example.com
  React static build

https://api.example.com
  Node.js / Express API

localhost:3306
  MySQL or MariaDB
```

## Production Requirements

- Hosting with Node.js support.
- MySQL or MariaDB database.
- Static file hosting for the React build.
- HTTPS enabled for frontend and API domains.
- SMTP account if verification, alerts and reminders must send real emails.
- Writable upload directories for event and category images.

## Backend Deployment

Upload or clone the repository on the server and install backend dependencies:

```bash
cd /home/your-user/api
npm install --production
```

The backend startup file is:

```text
server.js
```

Recommended backend environment:

```env
NODE_ENV=production
PORT=3001

DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306

JWT_SECRET=replace-with-a-long-random-secret
APP_BASE_URL=https://example.com
CORS_ORIGINS=https://example.com,https://www.example.com

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM="Ames Events <no-reply@example.com>"
```

Keep `.env` outside version control.

## Upload Directories

The backend can store uploaded images in explicit production directories:

```env
EVENT_IMAGES_DIR=/home/your-user/api/uploads/events
EVENT_IMAGES_PUBLIC_BASE_URL=https://api.example.com
CATEGORY_IMAGES_DIR=/home/your-user/api/uploads/categories
CATEGORY_IMAGES_PUBLIC_BASE_URL=https://api.example.com
```

Create the folders and make them writable by the Node.js process:

```bash
mkdir -p /home/your-user/api/uploads/events
mkdir -p /home/your-user/api/uploads/categories
chmod 755 /home/your-user/api/uploads
chmod 755 /home/your-user/api/uploads/events
chmod 755 /home/your-user/api/uploads/categories
```

## Frontend Deployment

Before building the frontend, configure the production API URL:

```env
REACT_APP_API_BASE_URL=https://api.example.com
```

Build the frontend:

```bash
cd frontend
npm install
npm run build
```

Upload the contents of:

```text
frontend/build
```

to the public web root of the frontend domain.

## React Router Rewrite

The frontend is a single-page application. The web server must redirect unknown paths to `index.html`.

Apache `.htaccess` example:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

## Database Deployment

Create an empty database with UTF-8 support:

```sql
CREATE DATABASE your_db_name
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Import schema and seed data:

```bash
mysql -u your_db_user -p your_db_name < database/schema.sql
mysql -u your_db_user -p your_db_name < database/seed.sql
```

On cPanel, the same can be done through phpMyAdmin import.

## Favorite Reminder Cron

In production hosting, use cron to run the reminder script explicitly. The Express server does not send favorite reminders during startup.

Example cron command:

```bash
cd /home/your-user/api && /path/to/node scripts/sendFavoriteReminders.js >> /home/your-user/api/scripts/cron_reminders.log 2>&1
```

The script sends reminders for events scheduled for tomorrow by default.

Manual test with a specific date:

```bash
cd /home/your-user/api
/path/to/node scripts/sendFavoriteReminders.js 2026-05-20
```

## Deployment Verification

Backend:

```bash
curl https://api.example.com/
```

Expected response:

```text
API Ames Events funcionando
```

Events API:

```bash
curl https://api.example.com/events
```

Frontend:

- open `https://example.com`;
- open `https://example.com/events`;
- open `https://example.com/map`;
- log in with a test or admin user;
- create or edit an event if using an admin/content manager account.

## Common Problems

### CORS Error

Check that `CORS_ORIGINS` contains the real frontend URL.

### JWT Secret Error

In production, `JWT_SECRET` must be configured.

### Database Access Denied

Check:

- `DB_HOST`;
- `DB_USER`;
- `DB_PASSWORD`;
- `DB_NAME`;
- database user permissions.

Also check that `DB_NAME` has no leading spaces or hidden characters.

### Emails Not Sent

Check SMTP variables and server logs. The reminder script reports skipped emails as `Omitidos`.

### Uploaded Images Not Visible

Check:

- upload directories exist;
- upload directories are writable;
- public base URL variables point to the API domain;
- `/uploads` is served by Express.

## Production Checklist

- [ ] Database created.
- [ ] Schema imported.
- [ ] Seed data imported if needed.
- [ ] Backend dependencies installed.
- [ ] Backend `.env` configured.
- [ ] `JWT_SECRET` changed.
- [ ] SMTP configured if email delivery is required.
- [ ] Upload directories created and writable.
- [ ] Backend app running.
- [ ] Frontend `.env` points to production API.
- [ ] Frontend build generated.
- [ ] Static build uploaded.
- [ ] React Router rewrite configured.
- [ ] HTTPS enabled.
- [ ] API health check passes.
- [ ] Event listing works from frontend.
- [ ] Login works.
- [ ] Admin event creation tested.
