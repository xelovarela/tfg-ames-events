# Content Manager Manual

## Introduction

The `content_manager` role is intended for users who can publish and maintain event content in Ames Events.

Content managers can:

- create events;
- edit events;
- duplicate events;
- select existing categories, locations, audiences and organizers when editing event data;
- view public catalogs and event information.

Content managers cannot:

- delete events;
- manage users;
- change user roles;
- review content manager requests;
- manage categories;
- manage locations;
- manage organizers;
- manage audiences;
- access admin-only user administration.

## Access

Content managers log in from:

```text
/login
```

After login, the interface shows the management actions available for the role.

Main routes:

- `/events`
- `/events/new`
- `/events/:id/edit`
- `/profile`

## Event Management

### Create an Event

Route:

```text
/events/new
```

Steps:

1. Open the event creation page.
2. Enter the event title.
3. Select the event date and time.
4. Add a description.
5. Upload an image if available.
6. Select whether the event is free or paid.
7. If it is paid, enter the price.
8. Select audience if applicable.
9. Select organizer if applicable.
10. Select category.
11. Select location.
12. Save the event.

Required fields:

- title;
- category;
- location;
- price when the event is paid.

Optional fields:

- description;
- date and time;
- image;
- audience;
- organizer.

### Event Images

When an image is uploaded, the backend processes it automatically:

- converts it to WebP;
- crops it to 16:9;
- resizes it to 900x506.

If no image is uploaded, the frontend uses:

1. the category image, if configured;
2. the local category fallback image;
3. the generic fallback image.

### Edit an Event

Route:

```text
/events/:id/edit
```

Steps:

1. Open the event list or event detail page.
2. Select the edit action.
3. Update the necessary fields.
4. Save changes.

The event date is treated as a local event date and time. It should remain the same between local development and hosting.

### Duplicate an Event

Content managers can duplicate an event to reuse its information.

Steps:

1. Open the event list or detail page.
2. Select duplicate.
3. Review the copied data.
4. Choose a new date.
5. Save the duplicated event.

This is useful for recurring activities or similar events in different dates.

### Delete an Event

Content managers cannot delete events. Event deletion is restricted to `admin`.

If an event must be removed, contact an administrator.

## Catalog Usage

Content managers cannot manage category, location or organizer records. These catalogs are maintained by administrators because changes can affect many events and the public map.

Content managers can select existing catalog values when creating, editing or duplicating events:

- categories classify events and provide fallback images;
- locations define place, locality and coordinates;
- organizers identify the entity responsible for the activity;
- audiences describe the target public for events.

If a required category, location or organizer does not exist, contact an administrator.

Locations are used by:

- event forms;
- map markers;
- locality filters;
- event detail pages.

## Audience Catalog

Route:

```text
/audiences
```

Content managers cannot manage audiences. Audience creation, editing and deletion are restricted to `admin`.

Content managers can select existing audiences when creating or editing events.

## Profile Management

Route:

```text
/profile
```

Content managers can:

- update their username;
- change their password.

Password requirements:

- at least 8 characters;
- password confirmation must match in forms that request it;
- current password is required when changing the password from the profile page.

## Favorites and Alerts

Content managers can also use user-facing features:

- save events as favorites;
- view favorites from `/favorites`;
- create and manage alerts from `/alerts`.

These features work the same as for regular users.

## Publishing Checklist

Before saving or updating an event, check:

- title is clear and concise;
- date and time are correct;
- location is correct;
- category matches the event;
- audience is appropriate;
- organizer is selected if known;
- price is correct;
- image is relevant and readable;
- description contains enough information for families or attendees.

## Common Problems

### I Cannot Access Event Creation

Check that the account role is `content_manager` or `admin`.

If the account was recently approved, log out and log back in so the session receives the updated role.

### I Cannot Delete an Event

This is expected. Only admins can delete events.

### I Cannot Manage Audiences

Audience management is admin-only.

### Uploaded Image Does Not Appear

Check:

- the image format is supported;
- the upload completed successfully;
- the event was saved after selecting the file;
- the backend upload directory is configured correctly in production.

### Event Time Looks Wrong in Hosting

The application treats event dates as local datetimes. If an old event was saved before the timezone fix, edit and save the correct date and time again.

## Good Practices

- Reuse existing categories, locations and organizers.
- Use concise event titles.
- Keep descriptions useful and readable.
- Upload images with clear subject matter.
- Review event details after saving.
- Ask an admin when a structural catalog change is needed.
