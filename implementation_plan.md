# Add Authentication, Publishing Controls, and Dashboard

Here is the implementation plan to address the logical issues and introduce the dashboard with publishing and custom URL control.

## Problem Description
Currently, the Everlasting generator works without authentication, meaning anyone can create a page, but there's no way to modify them or group them to a specific user. The URL is generated randomly, and pages are implicitly "published" forever. 

To solve this we will:
1. Allow users to register and log in to a **Dashboard** to manage their pages.
2. Enable users to choose a **custom URL slug** (e.g. `https://your-domain.com/w/my-wedding`).
3. Add an `is_published` toggle so the user has control over visibility.

## Proposed Changes

### Database Changes (`everlasting.db`)
We will create a new `users` table and update the existing `weddings` table to implement associations and publishing state.

#### [NEW] `users` table
- `id` (INTEGER PRIMARY KEY)
- `email` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `created_at` (DATETIME)

#### [MODIFY] `weddings` table
Add new columns to support the new features:
- `user_id` (INTEGER, FOREIGN KEY reference to `users.id`)
- `is_published` (INTEGER DEFAULT 1) - used to toggle visibility.

> [!WARNING]
> Existing wedding pages will be orphaned (have no `user_id`), but will continue to function.

---

### Backend (`server.ts`)

#### [MODIFY] `server.ts`
- **Dependencies**: Add `bcryptjs` and `jsonwebtoken` for secure password hashing and token generation. Using `bcryptjs` avoids native build issues on Windows.
- **Middleware**: Introduce an `authenticateToken` middleware to protect specific routes.
- **New Routes**:
  - `POST /api/auth/register` - Create user.
  - `POST /api/auth/login` - Authenticate and return JWT.
  - `GET /api/user/weddings` - Retrieve all weddings created by the authenticated user.
  - `PATCH /api/weddings/:id/publish` - Toggle the `is_published` status.
- **Updated Routes**:
  - `POST /api/weddings`: Require authentication. Support passing a `customSlug` instead of forcing a random generated slug. Return an error if the chosen slug is already taken.
  - `GET /api/weddings/:slug`: Decline rendering the wedding object if `is_published` is 0 (false), returning a 404/403 status instead.

---

### Frontend Components (`src/`)

#### [NEW] `src/context/AuthContext.tsx`
- Implement a global context to provide user authentication state and login/logout methods across the application.

#### [NEW] `src/pages/LoginPage.tsx` & `src/pages/RegisterPage.tsx`
- Create aesthetic login and registration interfaces aligned with the application's clean design.

#### [NEW] `src/pages/DashboardPage.tsx`
- Create a dashboard summarizing user's created weddings.
- UI elements to enable "Unpublish/Publish", and view the live page.

#### [MODIFY] `src/App.tsx`
- Integrate new routes (`/login`, `/register`, `/dashboard`).
- Implement protected routes wrapper to prevent unauthenticated access to the dashboard or creator tool.

#### [MODIFY] `src/pages/CreatePage.tsx`
- Detect if the user is authenticated; if not, prompt them to login.
- **Step 4 (Final Touches) Update**: Add an input field for **Custom URL Slug**, auto-filling it with the random generated suggestion but allowing the user to change it to match your requested functionality (e.g. `[my-domain].[domain]/blablabla`).

## Verification Plan

### Automated Tests
- N/A - we will do end-to-end testing manually.

### Manual Verification
1. Run application and register a test user.
2. Ensure you are redirected to the Dashboard.
3. Generate a new wedding page with a custom specific slug (e.g., `test-wedding-123`).
4. Validate the page loads at `/w/test-wedding-123`.
5. From the dashboard, toggle the page to offline (Unpublish).
6. Verify `/w/test-wedding-123` correctly returns a 404/Offline message.
