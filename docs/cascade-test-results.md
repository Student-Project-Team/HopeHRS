# Cascade & Visibility Matrix – Sprint 2, PR-02

**Manual Testing Results**  
**Environment:** localhost:3000  
**Test Date:** _______________

---

| Test ID | Description | USER | ADMIN | SUPERADMIN |
|---------|-------------|------|-------|-------------|
| TC01 | Soft-delete employee 00001 → job history disappears for USER | PASS | N/A | N/A |
| TC02 | Soft-delete employee 00001 → ADMIN sees in Deleted Items | N/A | PASS | N/A |
| TC03 | Recover employee 00001 → job history reappears for USER | PASS | N/A | N/A |
| TC04 | USER calls getEmployees() without filter → INACTIVE rows hidden from all 4 tables | PASS | N/A | N/A |
| TC05 | Stamp column ABSENT in all 4 tables for USER | PASS | FAIL | FAIL |
| TC06 | Stamp column PRESENT in all 4 tables for ADMIN | FAIL | PASS | PASS |
| TC07 | No hard delete .delete( calls in HR tables codebase | PASS | PASS | PASS |

---

## Pass Count Status

| Role | Expected PASS | Actual PASS | Status |
|------|---------------|-------------|--------|
| USER | 4 | _____ | ⬜ All PASS / ⬜ Some FAIL |
| ADMIN | 3 | _____ | ⬜ All PASS / ⬜ Some FAIL |
| SUPERADMIN | 1 | _____ | ⬜ All PASS / ⬜ Some FAIL |

**TOTAL PASS: _____ / 8**

---

## Failed Tests Summary

| Test ID | Expected | Actual | Severity |
|---------|----------|--------|----------|
| | | | ⬜ High / ⬜ Med / ⬜ Low |

---

## Environment

| Item | Value |
|------|-------|
| Local URL | http://localhost:_____ |
| Browser | |
| Test Employee ID | 00001 |

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Tester | | |

---

**Overall Status:** ⬜ All PASS / ⬜ Some FAIL
