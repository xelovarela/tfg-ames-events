# User Manual

## Introduction

Ames Events is a web application for discovering local, family and children's events in Ames. Users can browse the event agenda, view events on a map, check a monthly calendar, save favorite events and create alerts to receive email notifications when matching events are published.

## Public Navigation

The public area is available without logging in.

Main pages:

- `/`: home page with highlighted and upcoming events.
- `/events`: event list.
- `/events/calendar`: monthly event calendar.
- `/map`: interactive map of events.
- `/events/:id`: event detail page.
- `/acerca-de`, `/contacto`, `/ayuda`, `/accesibilidad`, `/privacidad`, `/aviso-legal`, `/mapa-del-sitio`: informational pages.

## Browse Events

1. Open the event list from the main navigation.
2. Review event cards with title, date, category, location, price and audience.
3. Use pagination to move through the list.
4. Select an event card to open the detail page.

The event detail page includes:

- event title and description;
- date and time;
- location;
- category;
- audience;
- organizer;
- price;
- image;
- favorite action when logged in;
- share action;
- option to add the event to Google Calendar.

## Filter Events

The event list, map and calendar share the same filtering system.

Available filters:

- search text;
- date preset;
- category;
- location/locality;
- audience;
- free events only.

Filters are synchronized with the URL, so filtered views can be shared or reopened later.

## Use the Calendar

1. Open `/events/calendar`.
2. Navigate between months using the calendar controls.
3. Select an event from a day cell to open its detail page.

Events are grouped by day and ordered by time.

## Use the Map

1. Open `/map`.
2. Browse markers grouped by event location.
3. Select a marker to see the events available at that location.
4. Open the event detail from the popup.

The map includes contextual layers for Ames and reference areas such as Bertamiráns and O Milladoiro.

## Create an Account

1. Open `/register`.
2. Enter username, email and password.
3. Confirm the password.
4. Submit the form.
5. Check the verification email and open the verification link.

Password requirements:

- at least 8 characters;
- password and confirmation must match.

After verification, the account can log in normally.

## Log In

1. Open `/login`.
2. Enter username or email.
3. Enter password.
4. Submit the form.

If the email has not been verified, use the resend verification option from the login page.

## Reset a Password

1. Open `/forgot-password`.
2. Enter the account email.
3. Check the reset email.
4. Open the reset link.
5. Enter and confirm the new password.

The reset link expires after a limited time.

## Manage Profile

Authenticated users can open `/profile` to:

- update their username;
- change their password.

To change the password, the current password is required.

## Favorites

Users with role `user`, `admin` or `content_manager` can save events as favorites.

To add a favorite:

1. Log in.
2. Open an event detail page or a list card with favorite action.
3. Select the favorite button.

To view saved favorites:

1. Open `/favorites`.
2. Review the list of saved events.
3. Remove any event that is no longer relevant.

Favorite events can be used by the system to send reminder emails when the administrator runs or schedules the reminder script.

## Alerts

Authenticated users can create alerts from `/alerts`.

An alert must include a name and at least one criterion:

- category;
- locality;
- audience;
- keyword.

When a new event matches an active alert, the system can send an email notification if the account is active and verified.

Users can:

- create alerts;
- edit alerts;
- activate or deactivate alerts;
- delete alerts.

## Request Content Manager Access

Users who want to publish events can request access from `/propose-event`.

The request form includes:

- contact phone, optional;
- organization name, optional;
- request title;
- explanation of why the user wants to publish events.

The request is reviewed by an administrator. If approved, the user role changes to `content_manager`.

## Common Problems

### I Cannot Log In

Check that:

- the username/email and password are correct;
- the email account has been verified;
- the account has not been disabled.

### I Do Not Receive Emails

Check spam or promotions folders. Email delivery also depends on SMTP configuration in the server.

### I Cannot Add Favorites

Favorites require an authenticated account with role `user`, `admin` or `content_manager`.

### I Cannot Publish Events

Only `admin` and `content_manager` users can create or edit events. Regular users must request content manager access first.
