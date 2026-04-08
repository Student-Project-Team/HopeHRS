-- ============================================
--  Verification Queries (for PR-04)
-- ============================================

-- Verify row counts
SELECT 'employee' AS table_name, COUNT(*) AS row_count FROM employee
UNION ALL
SELECT 'department', COUNT(*) FROM department
UNION ALL
SELECT 'job', COUNT(*) FROM job
UNION ALL
SELECT 'jobHistory', COUNT(*) FROM jobHistory
UNION ALL
SELECT 'Module', COUNT(*) FROM Module
UNION ALL
SELECT 'rights', COUNT(*) FROM rights
UNION ALL
SELECT 'user', COUNT(*) FROM "user"
UNION ALL
SELECT 'UserModule_Rights', COUNT(*) FROM UserModule_Rights;
