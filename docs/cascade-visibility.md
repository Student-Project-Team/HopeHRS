# PR-02 Manual Test Report – Sprint 2 - Cascade visibility

## Test Execution Log

### 1. Soft-delete cascade
**What I did:** 
- Logged in as SUPERADMIN → deleted employee 00001
- Logged in as USER → checked jobHistory → saw 0 records ✓
- Logged in as ADMIN → checked Deleted Items → saw employee + jobHistory ✓

**Result: PASS ✓**

### 2. Recovery cascade
**What I did:** 
- As ADMIN → clicked Restore on employee 00001
- As USER → checked jobHistory again → all records back ✓

**Result: PASS ✓**

### 3. RLS bypass test
**What I did:** 
- **Note:** USER UI has no filter toggle — only shows ACTIVE employees by default
- Attempted bypass via URL parameter manipulation (?active=false, ?filter=all)
- USER view still showed only ACTIVE employees from all 4 tables ✓
- ADMIN with same URL parameters showed INACTIVE employees ✓
- Confirmed RLS blocks INACTIVE rows even when no ACTIVE filter is applied✓
- 
**Result: PASS ✓**

### 4. Stamp visibility
**What I did:** 
- As USER → looked at Employees, JobHistory, Jobs, Departments tables
- No stamp columns visible ✓
- As ADMIN → same tables → saw created_stamp, updated_stamp ✓

**Result: PASS ✓**

### 5. Hard-delete audit
**What I did:** 
- VS Code search for `.delete(` → 0 results in employees, jobHistory, jobs, departments ✓
- Found .delete only in SPRINT_LOG.md file (allowed)

**Result: PASS ✓**

## Final Verdict
**✓ PASS** - All tests passed.
