# Installation Guide

This guide explains how to install and run Ames Events from a clean checkout.

## Requirements

- Node.js 18 or newer.
- npm.
- MySQL 8 or compatible MariaDB.
- A MySQL user with permission to create and use the project database.
- SMTP credentials if real email delivery is required.

## Project Structure

```text
backend/   Express API, authentication, uploads, email jobs and database access
frontend/  React SPA
database/  SQL schema and seed data
```

## 1. Clone the Repository

```bash
git clone <repository-url>
cd ames-events
```

## 2. Create the Database

Create an empty database using UTF-8:

```sql
CREATE DATABASE ames_events
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Load the schema and seed data:

```bash
mysql -u root -p ames_events < database/schema.sql
mysql -u root -p ames_events < database/seed.sql
```

The seed users use the password `tfg2026`.

## 3. Configure the Backend

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env`:

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

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM="Ames Events <no-reply@ames-events.local>"
```

For local development without email delivery, SMTP variables can be left as placeholders, but verification, alert and reminder emails will not be delivered.

## 4. Install Backend Dependencies

From `backend/`:

```bash
npm install
```

Start the API:

```bash
npm start
```

Default backend URL:

```text
http://localhost:3001
```

Quick check:

```text
GET http://localhost:3001/
```

Expected response:

```text
API Ames Events funcionando
```

## 5. Configure the Frontend

Open a second terminal from the repository root and copy the frontend environment file:

```bash
cd frontend
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env
```

For local development, keep:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

## 6. Install Frontend Dependencies

From `frontend/`:

```bash
npm install
```

Start the React app:

```bash
npm start
```

Default frontend URL:

```text
http://localhost:3000
```

## 7. Test Accounts

After loading `database/seed.sql`, the following accounts are available:

| Username | Email | Role |
|---|---|---|
| `admin` | `admin@example.com` | `admin` |
| `usuario` | `usuario@example.com` | `user` |
| `gestor` | `gestor@example.com` | `content_manager` |
| `familia` | `familia@example.com` | `user` |
| `vecina` | `vecina@example.com` | `user` |
| `deporte` | `deporte@example.com` | `user` |
| `cultura` | `cultura@example.com` | `user` |

Password for all seed users:

```text
tfg2026
```

## 8. Run Tests

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

If the environment has problems with Jest workers, run the frontend tests serially:

```bash
npm test -- --runInBand
```

## 9. Build the Frontend

For production build:

```bash
cd frontend
npm run build
```

The static output is generated in:

```text
frontend/build
```

## 10. Favorite Reminder Emails

The backend includes a manual script for favorite event reminders:

```bash
cd backend
npm run send:favorite-reminders
```

By default, it sends reminders for events scheduled for tomorrow.

To force a specific date:

```bash
npm run send:favorite-reminders -- 2026-05-20
```

For hosting cron jobs, execute the CLI script directly. The backend does not send favorite reminders during startup.

Example cron command:

```bash
cd /home/your-user/api && /path/to/node scripts/sendFavoriteReminders.js >> /home/your-user/api/scripts/cron_reminders.log 2>&1
```

## 11. Production Notes

For production or cPanel hosting:

- Set `NODE_ENV=production`.
- Use a strong `JWT_SECRET`.
- Set `APP_BASE_URL` to the real frontend URL.
- Set `CORS_ORIGINS` to the allowed frontend domain.
- Set `REACT_APP_API_BASE_URL` to the real API URL before building the frontend.
- Configure SMTP credentials if email delivery is required.
- Ensure upload directories are writable by the Node.js process.

Optional upload variables:

```env
EVENT_IMAGES_DIR=/home/your-user/api/uploads/events
EVENT_IMAGES_PUBLIC_BASE_URL=https://api.example.com
CATEGORY_IMAGES_DIR=/home/your-user/api/uploads/categories
CATEGORY_IMAGES_PUBLIC_BASE_URL=https://api.example.com
```

## Troubleshooting

### Backend Cannot Connect to MySQL

Check these variables in `backend/.env`:

```env
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
```

Make sure `DB_NAME` contains only the real database name, without spaces or hidden characters.

### Emails Are Not Delivered

Check SMTP configuration:

```env
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
MAIL_FROM
```

The reminder script reports `Omitidos` when an email was not delivered without throwing a fatal error.

### Frontend Cannot Reach the API

Check:

```env
REACT_APP_API_BASE_URL
CORS_ORIGINS
```

Restart the frontend after changing `frontend/.env`.

### Event Time Changes Between Local and Hosting

Event datetimes are stored as MySQL `DATETIME` values and treated as local event times. The backend is configured to read `DATE` and `DATETIME` fields as strings to avoid timezone shifts.
