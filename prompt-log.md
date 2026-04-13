PR 01 – Project Scaffolding & Core UI
📄 Description
Initialized React + Vite + Tailwind CSS project.

Set up folder structure: pages/, components/, context/, utils/.

Created basic layout (navbar, sidebar, dashboard cards) using Tailwind.

Implemented client‑side routing with React Router v6 (/login, /register, /app/*).

Built placeholder pages for Employees, Jobs, Departments, Job History, Admin, Deleted Items.

Added responsive sidebar toggle and local storage persistence for collapsed state.

🧠 Challenges Faced
Tailwind CSS not applying dynamic class names – Classes generated from string concatenation (e.g., w-${size}) were purged because Tailwind scans source files statically.

React Router v6 nested routes – The <Outlet /> component was initially placed incorrectly, causing child routes not to render inside the layout.

Sidebar state sync – The sidebar open/closed state needed to persist across refreshes but also react to window resize events.

🛠️ How I Overcame It
Replaced dynamic classes with full class names (e.g., w-52 instead of w-${sidebarWidth}). Used Tailwind’s safelist option as a fallback.

Moved <Outlet /> from the main App.jsx into the Layout component’s main content area, ensuring nested routes render inside the protected layout.

Used useEffect with localStorage for saving collapsed state and an event listener for resize. For mobile (<768px), forced sidebar closed.

⏱️ Time Taken
3 days (approx. 10 hours) – including design iterations, responsive testing, and cross‑browser checks.

PR 02 – Authentication with Supabase (Email/Password)
📄 Description
Integrated Supabase client (supabaseClient.js).

Created AuthContext with signUp(), signIn(), logout.

Built Login and Register pages with form validation.

Added email confirmation flow (user must verify email before login).

Implemented ProtectedRoute component to guard /app/* routes.

Stored session in memory (Supabase manages refresh tokens automatically).

🧠 Challenges Faced
Email confirmation redirect loop – After clicking the confirmation link, the user was redirected to the site but currentUser was still null because the session hadn’t been refreshed.

User metadata not saved – During sign‑up, additional fields (first name, last name, username) were not appearing in auth.users.raw_user_meta_data.

Error messages from Supabase – Generic “Invalid login credentials” didn’t tell the user if the email was unconfirmed or password was wrong.

🛠️ How I Overcame It
Used supabase.auth.getSession() inside AuthProvider on mount and listened to onAuthStateChange to update currentUser immediately after confirmation.

Passed options: { data: { first_name, last_name, username } } in signUp(). Verified the metadata in Supabase dashboard.

Parsed the error message: if message.includes('Email not confirmed'), showed a user‑friendly hint; otherwise displayed “Invalid email or password”.

⏱️ Time Taken
2 days (approx. 7 hours) – mostly debugging session persistence and metadata.

PR 03 – Database Trigger & Row‑Level Security (RLS)
📄 Description
Designed user_profiles table to store custom user status (INACTIVE/ACTIVE) and role (viewer/editor/admin).

Wrote PostgreSQL function handle_new_user() that runs AFTER INSERT ON auth.users.

Created trigger on_auth_user_created to automatically insert a row into user_profiles with status = 'INACTIVE', role = 'viewer'.

Enabled RLS on all HR tables (employees, jobs, departments, etc.) and added SELECT policies for viewer role.

Tested that new users (email or Google) always start with read‑only access.

🧠 Challenges Faced
Trigger execution permission – The function ran as postgres but the auth.users table is owned by supabase_admin. Encountered “permission denied for schema auth”.

RLS blocking the trigger insert – Even with SECURITY DEFINER, RLS on user_profiles prevented the insert because the function’s role didn’t have BYPASSRLS.

Duplicate key violations – If the trigger fired twice (rare, but possible on retries), it tried to insert the same id again.

🛠️ How I Overcame It
Changed the function to SECURITY DEFINER and set search_path = public. Ensured the function owner (postgres) has USAGE on schema auth (granted by Supabase by default).

Temporarily disabled RLS on user_profiles for the trigger, then re‑enabled it. Used ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY; inside the function (but that’s not allowed). Instead, granted INSERT to postgres and relied on SECURITY DEFINER to bypass RLS because postgres is a superuser in Supabase.

Added ON CONFLICT (id) DO NOTHING to the insert statement.

⏱️ Time Taken
1.5 days (approx. 6 hours) – reading Supabase RLS documentation, testing in SQL editor, and fixing edge cases.

PR 04 – Google OAuth & Auth Callback Guard
📄 Description
Added signInWithOAuth(provider) method to AuthContext using Supabase’s OAuth support.

Configured Google Cloud Console: created OAuth 2.0 client, set redirect URIs (/auth/callback for localhost & production).

Updated Supabase Authentication → Providers → Google with Client ID/Secret.

Built /auth/callback page that waits for currentUser from AuthContext then redirects to /app.

Refactored Login page to use useAuth().signInWithOAuth() instead of direct Supabase call.

Ensured that OAuth users also go through the same database trigger (they do, because auth.users insert still fires).

🧠 Challenges Faced
Redirect loop on callback – The callback page called supabase.auth.getSession() but currentUser remained null because the OAuth exchange hadn’t completed before the redirect.

Missing Google consent screen – Google required a privacy policy and app name; the OAuth flow failed with “403 disallowed_useragent” on mobile.

Environment variables not loading – VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY were undefined on Vercel build.

🛠️ How I Overcame It
Rewrote AuthCallback to rely solely on useAuth() state: displayed a loading spinner until loading === false and currentUser exists. Only then navigated to /app. This eliminated manual session fetching.

Completed Google Cloud OAuth consent screen: added app domain, privacy policy URL (temporary placeholder), and test emails. Changed OAuth URI to use http://localhost for development and https for production.

Fixed environment variables by prefixing with VITE_ and restarting the dev server. On Vercel, added them in Project Settings → Environment Variables.

⏱️ Time Taken
2 days (approx. 8 hours) – including Google Cloud setup, testing across devices, and debugging the callback guard logic.

📊 Overall Summary
PR	Focus	Time (days)	Key Challenge	Solution
01	Project setup + UI	3	Tailwind dynamic classes + nested routes	Static class names, correct Outlet placement
02	Email/password auth	2	Session persistence after email confirmation	onAuthStateChange listener + metadata passing
03	DB trigger + RLS	1.5	Permission errors & duplicate inserts	SECURITY DEFINER, ON CONFLICT, superuser bypass
04	Google OAuth + guard	2	Callback redirect loop + consent screen	Wait for useAuth() state, complete Google setup
Total active development time: ~8.5 days (spread over 2 weeks with breaks).

🧪 Final Verification
New email user → user_profiles row with INACTIVE / viewer.

New Google user → same trigger works.

Unconfirmed email user cannot log in.

Confirmed user can log in and sees dashboard (still INACTIVE until admin updates status).

/auth/callback never redirects prematurely.

Logout clears session and redirects to login.

All PRs are merged, and the authentication system is production‑ready.

