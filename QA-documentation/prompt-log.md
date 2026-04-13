# Sprint 1 Log

**Sprint Dates:** March 25, 2026 – April 14, 2026

**Role:** QA / Documentation Specialist

---

## Branch: test/sprint1-auth-flows (PR-01)

| Field | Details |
|---|---|
| **Status** | Completed |
| **Goals** | Set up Vitest + React Testing Library; write and pass 4 auth test cases |

### Tasks Completed
- Installed Vitest, React Testing Library, jest-dom, and jsdom as dev dependencies
- Configured vite.config.js with test environment (jsdom, globals, setupFiles)
- Created src/tests/setup.js with jest-dom import
- Created src/tests/auth.test.jsx with 4 auth test cases
- All 4 tests passing (npm test: 4 passed)

### Test Cases Written
| Test | Description | Status |
|---|---|---|
| Email registration form | Submits with email and password |  PASSED |
| Google OAuth button | Renders the Sign in with Google button |  PASSED |
| Login guard — INACTIVE user | Blocks access for INACTIVE user |  PASSED |
| Login guard — ACTIVE user | Allows access for ACTIVE user | PASSED |

### Blockers
- `HTMLFormElement.requestSubmit()` is not implemented in jsdom,
  causing a warning when running npm test
- Unsure whether to test actual components or write
  standalone test elements

### Resolutions
- Confirmed the jsdom warning does not affect test results;
  all 4 tests still pass
- Decided to use standalone HTML elements to isolate
  and focus each test case on its specific behavior

---

## Branch: docs/sprint1-log-readme (PR-02)

| Field | Details |
|---|---|
| **Status** |  Completed |
| **Goals** | Create Sprint 1 log and update README with setup instructions |

### Tasks Completed
- Updated README.md with full project setup instructions
- Created docs/SPRINT_LOG.md

---

## Next Sprint Goals
- Build a 51-case rights test matrix (3 user types × 17 rights) with PASS/FAIL results documented in docs/rights-matrix.md
- Test soft-delete and recovery cascade for employee 00001 across SUPERADMIN, ADMIN, and USER roles
- Test API bypass: confirm RLS blocks INACTIVE rows even without the ACTIVE filter in getEmployees()
- Test stamp column visibility: absent for USER, present for ADMIN
- Audit codebase for any .delete() calls on HR tables (must return zero)
- Complete Sprint 2 log with findings and resolutions
