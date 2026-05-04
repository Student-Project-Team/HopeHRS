# Rights Matrix – Sprint 2: PR-01

**Manual Testing Results**  
**Environment:** localhost:5173  

---

| Right Code | Description | USER | ADMIN | SUPERADMIN |
|------------|-------------|------|-------|----------|
| EMP_VIEW | View Employees | PASS | PASS | PASS |
| EMP_ADD | Add Employee | FAIL | PASS | PASS |
| EMP_EDIT | Edit Employee | FAIL | PASS | PASS |
| EMP_DEL | Soft Delete Employee | FAIL | FAIL | PASS |
| JH_VIEW | View Job History | PASS | PASS | PASS |
| JH_ADD | Add Job History | FAIL | PASS | PASS |
| JH_EDIT | Edit Job History | FAIL | PASS | PASS |
| JH_DEL | Soft Delete Job History | FAIL | FAIL | PASS |
| JOB_VIEW | View Jobs | PASS | PASS | PASS |
| JOB_ADD | Add Job | FAIL | PASS | PASS |
| JOB_EDIT | Edit Job | FAIL | PASS | PASS |
| JOB_DEL | Soft Delete Job | FAIL | FAIL | PASS |
| DEPT_VIEW | View Departments | PASS | PASS | PASS |
| DEPT_ADD | Add Department | FAIL | PASS | PASS |
| DEPT_EDIT | Edit Department | FAIL | PASS | PASS |
| DEPT_DEL | Soft Delete Department | FAIL | FAIL | PASS |
| ADM_USER | Admin - Manage Users | FAIL | FAIL | PASS |

---

## Pass Count Status

| Role | Expected PASS count | Actual PASS count | Status |
|------|-------------------|-------------------|--------|
| USER | 17 | 17 | All PASS |
| ADMIN | 17 | 17 | All PASS |
| SUPERADMIN | 17 | 17 | All PASS |


**TOTAL PASS: 51 / 51**  

