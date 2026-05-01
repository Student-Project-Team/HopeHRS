## Sprint 1 Log — QA / Documentation Specialist

**Sprint Dates:** [March 25, 2026] – [April 14,  2026]

### Tasks Completed
- Installed and configured Vitest, React Testing Library, jest-dom, jsdom
- Configured vite.config.js with test environment settings
- Created src/tests/setup.js with jest-dom import
- Wrote 4 auth test cases in src/tests/auth.test.jsx (all passing)
- Created Sprint 1 log document
- Updated README.md with setup instructions
  
### Blockers
- `HTMLFormElement.requestSubmit()` is not implemented in jsdom, causing a warning when running npm test
- Unsure whether to test actual components or write standalone test elements

### Resolutions
- Confirmed the jsdom warning does not affect test results; all 4 tests still pass
- Decided to use standalone HTML elements to isolate and focus each test case on its specific behavior

### Goals for Sprint 2
- Build a 51-case rights test matrix (3 user types × 17 rights) with PASS/FAIL results documented in docs/rights-matrix.md
- Test soft-delete and recovery cascade for employee 00001 across SUPERADMIN, ADMIN, and USER roles
- Test API bypass: confirm RLS blocks INACTIVE rows even without the ACTIVE filter in getEmployees()
- Test stamp column visibility: absent for USER, present for ADMIN
- Audit codebase for any .delete() calls on HR tables (must return zero)
- Complete Sprint 2 log with findings and resolutions
