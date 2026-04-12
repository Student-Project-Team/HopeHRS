Sprint 1
04/08/26
# PR-01 — Login Page

**Branch:** `feat/login-authentication`
**Status:** Complete

## Goal
Allow HR employees to securely log in to the dashboard with proper
validation, error handling, and route protection.

## Details
Built a fully functional `/login` page using React 19, React Router v7,
and Tailwind CSS. The form includes email and password fields with
real-time validation that checks for empty inputs and proper email format
(must contain `@` and `.`). On submit, a loading spinner appears while
credentials are checked against a mock user database in `localStorage`.
On success, user info (email, first name, last name) is saved and the
user is redirected to `/app`. On failure, clear error messages guide
users to fix their input.

A "Sign in with Google" button is included, currently redirecting to
`/callback` as an OAuth placeholder. A link to `/register` is available
for new users. A `ProtectedRoute` component was also created to block
unauthorized access — any unauthenticated user visiting restricted routes
is automatically redirected back to `/login`. The page is fully responsive
across desktop, tablet, and mobile, with a clean white card layout,
subtle shadows, and blue accent buttons. All routes are configured in
`App.jsx` with the root path `/` redirecting to `/login`.

## Blockers / Challenges
No major blockers. Tailwind was already configured so setup was smooth.
Minor challenge was ensuring mock user data persisted across browser
sessions — solved using `localStorage` with `JSON.parse` and
`JSON.stringify`.

## Notes
> ⚠️ Mock data only — no real backend connected yet.

To test login, run in browser console (F12):
```js
localStorage.setItem('hr_mock_users', JSON.stringify([
  { email: "hr@hopehrs.com", password: "admin123",
    firstName: "HR", lastName: "Admin" }
]));
```
04/08/26
# PR-02 — Register Page

**Branch:** `feat/register-page`
**Status:** Complete

## Goal
Allow new HR employees to create accounts with comprehensive form
validation, duplicate detection, and seamless transition to the dashboard.

## Details
Built a fully functional `/register` page using React 19, React Router v7,
and Tailwind CSS. The form includes six fields: first name, last name,
username, email, and confirm password. All fields are required and the
form won't submit until all validations pass — first and last names need
at least 2 characters, username at least 3, email must contain `@` and
`.`, password at least 6 characters, and both passwords must match.

On submit, a loading spinner appears while the system checks for duplicate
emails or usernames in `localStorage`. Duplicates show clear error messages.
On success, the new user is added to `hr_mock_users`, auto-logged in via
`hr_current_user`, and redirected to `/app` without needing a separate
login step.

A "Register with Google" button is included, currently redirecting to
`/callback` as an OAuth placeholder. A link back to `/login` is available
for existing users. The page is fully responsive and matches the login
page design — white card, subtle shadows, and blue accent buttons.

## Blockers / Challenges
No major blockers. The page built smoothly on top of the existing login
infrastructure. One consideration was keeping the mock user data structure
consistent — both login and register now store `firstName`, `lastName`,
`username`, `email`, and `password`. Auto-login after registration was
added as a convenience to skip the extra step.

## Notes
> ⚠️ Mock data only — no real backend connected yet.
> `/app` dashboard is still a placeholder for a future PR.

To verify a new user was added, run in browser console (F12):
```js
JSON.parse(localStorage.getItem('hr_mock_users'))
```

04/08/26
# PR-03 — App Shell / Dashboard Layout

**Branch:** `feat/app-shell`
**Status:** Complete

## Goal
Build a professional dashboard layout that serves as the main container
for all HR modules, with responsive design, persistent navigation, user
session management, and logout functionality.

## Details
Built a complete application shell for the HR Management System using
React 19, React Router v7, and Tailwind CSS. The layout consists of three
main components: `Layout.jsx` (main container), `Navbar.jsx` (top
navigation bar), and `Sidebar.jsx` (collapsible side navigation).

The navbar displays the user's name pulled from `hr_current_user` in
`localStorage` and includes a logout button that clears the session and
redirects to `/login`. The sidebar features six navigation items —
Employees, Job History, Jobs, Departments, Admin, and Deleted Items —
with visual active states and smooth hover effects. The sidebar is
collapsible via a hamburger menu button in the navbar, and its collapsed
state persists across sessions using `localStorage`. On mobile (≤768px),
the sidebar automatically collapses and can be toggled open as needed.

The main content area shows a personalized welcome banner with the user's
name, followed by six HR module cards that serve as quick-access shortcuts.
The layout uses `Outlet` from React Router to render child routes, allowing
seamless navigation between modules without reloading the page. User
authentication is enforced in a `useEffect` hook — if no user is found in
`localStorage`, the user is immediately redirected to `/login`. The design
uses a clean white/gray color scheme with rounded corners, subtle shadows,
and blue accents consistent with the login and register pages.

## Blockers / Challenges
No major blockers. One consideration was handling sidebar state between
desktop and mobile — desktop remembers the collapsed state via
`localStorage`, while mobile always starts collapsed regardless of saved
preference. Another small adjustment was gracefully handling the display
name when only an email is available versus a full name from registration.
The logout function was passed from `Layout` to `Navbar` as a prop.

## Notes
> ⚠️ Module cards are placeholders — links to their respective pages
> will be implemented in future PRs.

The app shell is now the main container for all authenticated routes.
Child routes will render inside the `Outlet` component:

```
/app/employees
/app/job-history
/app/jobs
/app/departments
/app/admin
/app/deleted
```

04/08/26
# PR-04 — Auth Callback / Google OAuth Handler

**Branch:** `feat/auth-callback`
**Status:** Complete

## Goal
Implement a seamless OAuth callback handler that processes Google
authentication, automatically creates user accounts if they don't exist,
and provides visual feedback during the authentication process.

## Details
Built a complete authentication callback page (`/callback`) using React 19
and React Router v7. This page handles the redirect when users click
"Sign in with Google" or "Register with Google" on the login and register
pages.

On load, a `useEffect` hook automatically processes the authentication.
It retrieves existing mock users from `hr_mock_users` in `localStorage`,
then creates a simulated Google user with email `you@company.com`, first
name "Google", last name "User", and username "google_user". The system
checks if the email already exists — if not, a new account is created with
a placeholder password `google_oauth` and saved to `localStorage`. The
user session is then established by saving the user's info to
`hr_current_user`.

A 1.5-second delay simulates real OAuth network latency, during which a
centered loading spinner is shown with the message "Completing sign in..."
and "Establishing secure session with Google". After the delay, the user
is automatically redirected to `/app`. The design is clean and responsive,
consistent with the rest of the app.

## Blockers / Challenges
No major blockers. One design decision was whether to auto-create the
Google account or require manual registration — auto-create was chosen for
the best single-click experience. Since real Google OAuth isn't implemented
yet, `you@company.com` is hardcoded as a placeholder; in production this
would be replaced with actual profile data from Google's OAuth API. The
1.5-second delay was intentional to simulate realistic network conditions
and give users visual feedback.

## Notes
> ⚠️ Mock OAuth only — real Google OAuth is not connected yet.
> In production, replace the hardcoded `googleUser` object in
> `AuthCallback.jsx` with actual data returned from Google's OAuth API.

The callback page handles both scenarios — if the Google user already
exists from a previous sign-in, it simply logs them in without creating
a duplicate. If they don't exist, it creates the account first then logs
them in. The flow can be tested by clicking either Google button on the
login or register pages — the loading spinner will appear and redirect
to `/app` after 1.5 seconds.