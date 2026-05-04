# Sprint 3 End-to-End Production Test Report

**QA Lead:** Venice Marizene Linga

**Date:** May 5, 2026

**Environment:** Production (Vercel)

**Vercel URL:** https://hrssystem.vercel.app/login 

## Test Summary
| Test Category | Pass | Fail | Blocked |
| :--- | :--- | :--- | :--- |
| User Types (3) | 3 | 0 | 0 |
| HR Modules (4) | 4 | 0 | 0 |
| Reports (3) | 3 | 0 | 0 |
| Admin Activation | 1 | 0 | 0 |
| **TOTAL** | **11** | **0** | **0** |


**SUPERADMIN**
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/8b371894-b9bb-45f3-a963-49db01d19c0d" />

**ADMIN**
<img width="1919" height="873" alt="image" src="https://github.com/user-attachments/assets/b5a39101-a296-438f-be9f-d300bf41737e" />

**USER**
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/39bfc0fd-5831-4700-9d89-13b634518d0f" />

**HR MODULES**
<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/babf7b32-472a-482f-8bf3-a62f818e3f76" />
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/79a676f7-4e69-4b2e-b576-9b2735f6c081" />
<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/36e9ff9b-46ef-4b41-a948-b69ac29513b9" />
<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/6eaa622c-b09e-4201-86b3-d135f53554ed" />

**REPORTS**
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/f25b3d4b-7de5-43dd-aca6-e1073eba4c9d" />
<img width="1919" height="878" alt="image" src="https://github.com/user-attachments/assets/ff0bff89-9e34-41fe-a0d7-957bea462887" />
<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/11b40b54-eabb-484f-a73c-e6d42a6acdff" />

**ADMIN ACTIVATION**
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/71991453-a64f-41d8-a57b-ba887655533f" />


---

## 1. User Type Regression 
| User | View Admin | Activate/Deactivate | Change User Type | Status |
| :--- | :--- | :--- | :--- | :--- |
| USER (HR Staff) | No | No | No | ✅ Pass |
| ADMIN (HR Manager) | No | No | No | ✅ Pass |
| SUPERADMIN | Yes | Yes | Yes | ✅ Pass |

**USER CANNOT VIEW ADMIN PAGE; CANNOT ACTIVATE/DEACTIVATE; CANNOT CHANGE USER TYPE - DEFAULT**
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/aaa8f423-6c5d-42e9-bd3b-60acd2eb831f" />

**ADMIN CANNOT VIEW ADMIN PAGE; CANNOT ACTIVATE/DEACTIVATE; CANNOT CHANGE USER TYPE - DEFAULT**
<img width="1919" height="872" alt="image" src="https://github.com/user-attachments/assets/25c3c6f5-6a76-4b78-9a4e-9467ca97ff9b" />

**SUPERADMIN CAN VIEW ADMIN**
<img width="1919" height="872" alt="image" src="https://github.com/user-attachments/assets/a9fe6a5c-966e-463e-b40a-4947631ee8ec" />


---

## 2. SUPERADMIN Protection Test (Critical)

- **UI Block:** SUPERADMIN tries to Deactivate their own account.
  - *Result:* Button disabled. Tooltip "SUPERADMIN accounts cannot be modified" shown.
<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/834a991f-68f2-46c0-9c08-f7ba261164cd" />

- **RLS Block:** SUPERADMIN sends direct UPDATE via Supabase JS on their own row.
  - *Result:* `status: 403` - `new row violates row-level security policy`
<img width="687" height="871" alt="image" src="https://github.com/user-attachments/assets/4b6ce51b-4f3f-4ff4-ba35-8de0a54b56b5" />

## 3. Cascade Test (Soft Delete & Recover)
1.  Soft-deleted Employee `00001` (John Smith).
2.  Checked job_history table: Job records remain linked.
3.  Recovered Employee.
4.  Verified history restored.
- **Result:** Cascade logic works. ✅
 
<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/be48dbd1-4cc4-41ad-a386-141ee8656545" />
<img width="1919" height="879" alt="image" src="https://github.com/user-attachments/assets/a15e156e-2a86-4ae8-acd6-e63f41275164" />
<img width="1919" height="515" alt="image" src="https://github.com/user-attachments/assets/a13b827d-7617-4175-ad42-36edfede8213" />



## 4. Reports Validation
| Report | Data Matches DB? | UI Renders? |
| :--- | :--- | :--- |
| Headcount by Dept | ✅ Yes | Table & Chart |
| Salary Summary by Job | ✅ Yes | Table only |
| Employee Full History | ✅ Yes | Chronological |

---

## Conclusion
**Status: PRODUCTION READY** ✅

All 3 user types operate correctly. SUPERADMIN protection holds at UI and DB level. User Manual reflects current state.
