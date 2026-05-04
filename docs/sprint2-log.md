## Sprint 2 Log — QA / Documentation Specialist

**Sprint Dates:** [April 17, 2026] – [April 28, 2026]

### Tasks Completed
- Build a 51-case rights test matrix (3 user types × 17 rights) with PASS/FAIL results documented in docs/rights-matrix.md
- Test soft-delete and recovery cascade for employee 00001 across SUPERADMIN, ADMIN, and USER roles
- Test API bypass: confirm RLS blocks INACTIVE rows even without the ACTIVE filter in getEmployees()
- Test stamp column visibility: absent for USER, present for ADMIN
- Audit codebase for any .delete() calls on HR tables (must return zero)
  
### Blockers
- Inactive JobHistory of Employee 00037 (Yves Silva) visible in user's view
- AddJobHistory modal was not properly connected with the Supabase table.

### Resolutions
- Asked the UI developer to fix it and update the JobHistoryPanel component. JobHistory should be filtered based on user type.
- Asked the UI and Authentication Specialist to fix the AddJobHistory modal. Admin and Superadmin should be able to add job history without errors.

### Goals for Sprint 3
- Full end-to-end test in production: all 3 user types, all 4 HR modules, all 3 reports, admin activation — pass/fail recorded with screenshots
- SUPERADMIN protection test: ADMIN attempts to modify SUPERADMIN row in UserManagementPage — blocked at UI; ADMIN sends direct Supabase UPDATE — blocked by RLS
- Cascade test in production: soft-delete and recover employee in production environment, confirm job history cascades correctly
- User Manual finalized: covers registration (email + Google), login, Employee management with job history navigation, job and department management, reports, admin activation — screenshots from live app
- Sprint Deliverables & PR Expectations document (this document) reviewed and finalized
- Presentation slides prepared (12 slides: system overview, architecture, demo flow, rights matrix, cascade behavior, reports, lessons learned)
