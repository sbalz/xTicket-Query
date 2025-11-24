# End-User Service 2

**Version:** 2.0.0
**Author:** Steven Balz
**Email:** apps@sbalz.de
**Location:** User Sidebar

---

## Overview

The **End-User Service 2** app provides a secure, role-controlled way for support teams to manage end-user profiles directly in Zendesk user profile.

With this app, agents can:

- Display system and custom user fields with role-based access control
- Verify or set primary email addresses
- Add or remove user tags
- Change a user’s preferred language
- Unlock suspended users
- Open deeplinks from `external_id` fields to external systems

All actions occur in real time, without storing sensitive data locally, ensuring safe and auditable profile edits.

---

## Features

### Secure User Fields Display
- Shows system fields (`email`, `role`, `locale`) and custom fields
- Hidden fields remain inaccessible for non-admin users
- Supports clickable deeplinks from `external_id`

### Email Management
- Set as primary email
- Verify email address
- Remove email address

### User Tag Management
- Add or remove predefined tags
- Bulk selection supported

### Language Management
- Update preferred language securely

### Unsuspend Users
- Unlock suspended accounts safely

### External API Integration
- Optional API for performing secure operations with retry logic

---

## Security & Permissions

- **Role-Based Access:** Only users with the end-user role see the app
- **Field-Level Control:** Admins see all fields; non-admins see only `App Visible Fields`
- **Safe External Links:** `external_id` links open in a new tab with sanitized URLs
- **No Local Storage:** All data updates go through Zendesk APIs or a secure external API
- **Operation Logging:** All changes are audit-friendly and real-time

---

## Installation Instructions

1. Install **End-User Service 2** in your Zendesk account
2. Open the app from the user sidebar
3. Configure the app parameters:
 - **Hidden Fields:** Fields to hide from non-admin users (comma-separated)
 - **App Visible Fields:** Fields displayed in the app (comma-separated)
 - **Available Languages:** Supported languages (e.g., `de`, `en-US`)
 - **Provided User Tags:** Predefined tags that may be edited
 - **External Operational API:** Optional external API URL for secure operations
 - **External ID Source:** Template URL to generate deeplinks (e.g., `https://crm.example.com/user/{{external_id}}`)

---

## Usage

1. Open the app in the user sidebar
2. The app loads:
 - Visible system and custom fields
 - Emails with primary email highlighted
 - Tags and suspension status

3. **Email Management:** Select an email and click:
 - `Set as Primary`
 - `Verify`
 - `Remove`

4. **Tag Management:** Select tags and click `Add tag(s)` or `Remove tag(s)`

5. **Language Management:** Select a language and click `Change Language`

6. **Unsuspend Users:** Click `Unsuspend user` to unlock suspended accounts

_All actions are secure, role-controlled, and applied in real time._

---

## Technology Stack

- React
- TypeScript
- Zendesk App Framework (ZAF) v2
- `@zendeskgarden/react-accordions` & `@zendeskgarden/react-grid`
- Styled Components

---

## App Configuration Example

```json
{
   "app_id":0,
   "parameters":{
      "Hidden Fields":"usr_salutation, usr_internal_notes",
      "App Visible Fields":"usr_first_name, usr_last_name, email, external_id",
      "Available Languages":"de, en-US",
      "Provided User Tags":"usr_b2b_csat_permanent_bl, premium_user",
      "External Operational API":"https://api.example.com/",
      "External ID Source":"https://crm.example.com/user/{{external_id}}"
   }
}
