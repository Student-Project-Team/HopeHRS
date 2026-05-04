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

# Sprint 2 Log

**Sprint Dates:** April 17, 2026 – April 28, 2026

**Role:** QA / Documentation Specialist

---

## Branch: test/sprint2-rights-51-cases (PR-01)

| Field | Details |
|---|---|
| **Status** | Completed |
| **Goals** | 51-case rights matrix (3 user types × 17 rights) with pass/fail documentation |

**Tasks Completed:** Mapped 17 rights across all modules, executed all 51 test cases, documented results in `docs/rights-matrix.md`

**Test Cases Written:** 51 total — Employee (6), Job History (4), Department (3), Job (2), Reports (2) — all PASSED

**Blockers:** Unclear if ADMIN could edit SUPERADMIN-created employees

**Resolutions:** Confirmed ADMIN can view, edit, and add all records except ADMIN/SUPERADMIN rows; ADMIN cannot delete any records

---

## Branch: test/sprint2-cascade-visibility (PR-02)

| Field | Details |
|---|---|
| **Status** | Completed |
| **Goals** | Cascade, recovery, API bypass, and stamp visibility tests |

**Tasks Completed:** Soft-deleted/recovered employee 00001, verified jobHistory cascade, tested RLS bypass, confirmed stamp column visibility per role

**Test Cases Written:** 6 tests — all PASSED

| Test | Status |
|---|---|
| Soft-delete cascade (USER sees no jobHistory) | PASSED |
| Deleted Items visibility (ADMIN sees deleted) | PASSED |
| Recovery cascade (jobHistory reappears for USER) | PASSED |
| API bypass (RLS blocks INACTIVE rows) | PASSED |
| Stamp column absent for USER | PASSED |
| Stamp column present for ADMIN | PASSED |

**Blockers:** Unclear if USER should see soft-deleted records at all; 

**Resolutions:** Confirmed USER should see none; ADMIN sees inactive employees in both the Employees page and Deleted Items page; ADMIN can view, edit, and add but cannot delete any records

---

## Branch: docs/sprint2-log (PR-03)

| Field | Details |
|---|---|
| **Status** | Completed |
| **Goals** | Audit hard deletes, complete Sprint 2 log |

**Tasks Completed:** Searched codebase for `.delete(` on HR tables — zero results found. Finalized sprint documentation.

**Blockers:** None

---

## Next Sprint Goals

- Full production E2E test: 3 user types × 4 modules × 3 reports + admin activation — screenshots
- SUPERADMIN protection: ADMIN cannot modify SUPERADMIN via UI or direct Supabase UPDATE
- Production cascade test: soft-delete/recover employee, verify job history cascade
- Finalize User Manual with screenshots from live app
- Review Sprint Deliverables & PR Expectations document
- Prepare 12-slide presentation deck
