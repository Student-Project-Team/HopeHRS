-- ============================================
--  Create Rights & Auth Tables
-- ============================================

-- Drop existing if any (clean slate)
DROP TABLE IF EXISTS UserModule_Rights CASCADE;
DROP TABLE IF EXISTS user_module CASCADE;
DROP TABLE IF EXISTS rights CASCADE;
DROP TABLE IF EXISTS Module CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Create user table
CREATE TABLE "user" (
    email VARCHAR(100) PRIMARY KEY,
    user_type VARCHAR(20) DEFAULT 'USER',
    record_status VARCHAR(10) DEFAULT 'ACTIVE',
    stamp VARCHAR(60)
);

-- Create Module table (5 modules)
CREATE TABLE Module (
    module_code VARCHAR(20) PRIMARY KEY,
    module_name VARCHAR(50),
    record_status VARCHAR(10) DEFAULT 'ACTIVE',
    stamp VARCHAR(60)
);

-- Create rights table (17 rights)
CREATE TABLE rights (
    right_code VARCHAR(20) PRIMARY KEY,
    right_desc VARCHAR(50),
    right_value INT DEFAULT 1,
    module_code VARCHAR(20) REFERENCES Module(module_code),
    record_status VARCHAR(10) DEFAULT 'ACTIVE',
    stamp VARCHAR(60)
);

-- Create user_module table
CREATE TABLE user_module (
    email VARCHAR(100) REFERENCES "user"(email),
    module_code VARCHAR(20) REFERENCES Module(module_code),
    rights_value INT DEFAULT 0,
    PRIMARY KEY (email, module_code)
);

-- Create UserModule_Rights table
CREATE TABLE UserModule_Rights (
    email VARCHAR(100) REFERENCES "user"(email),
    right_code VARCHAR(20) REFERENCES rights(right_code),
    right_value INT DEFAULT 0,
    PRIMARY KEY (email, right_code)
);


-- ============================================
--  Seed 5 Modules
-- ============================================

INSERT INTO Module (module_code, module_name, record_status, stamp) VALUES
('Emp_Mod', 'Employee Module', 'ACTIVE', 'SEEDED'),
('JH_Mod', 'Job History Module', 'ACTIVE', 'SEEDED'),
('Job_Mod', 'Job Module', 'ACTIVE', 'SEEDED'),
('Dept_Mod', 'Department Module', 'ACTIVE', 'SEEDED'),
('Adm_Mod', 'Admin Module', 'ACTIVE', 'SEEDED');


-- ============================================
-- Seed 17 Rights
-- ============================================

INSERT INTO rights (right_code, right_desc, right_value, module_code, record_status, stamp) VALUES
-- Employee Module Rights (Emp_Mod)
('EMP_VIEW', 'View Employees', 1, 'Emp_Mod', 'ACTIVE', 'SEEDED'),
('EMP_ADD', 'Add Employee', 1, 'Emp_Mod', 'ACTIVE', 'SEEDED'),
('EMP_EDIT', 'Edit Employee', 1, 'Emp_Mod', 'ACTIVE', 'SEEDED'),


-- Job History Module Rights (JH_Mod)
('JH_VIEW', 'View Job History', 1, 'JH_Mod', 'ACTIVE', 'SEEDED'),
('JH_ADD', 'Add Job History', 1, 'JH_Mod', 'ACTIVE', 'SEEDED'),
('JH_EDIT', 'Edit Job History', 1, 'JH_Mod', 'ACTIVE', 'SEEDED'),
('JH_DEL', 'Soft Delete Job History', 1, 'JH_Mod', 'ACTIVE', 'SEEDED'),

-- Job Module Rights (Job_Mod)
('JOB_VIEW', 'View Jobs', 1, 'Job_Mod', 'ACTIVE', 'SEEDED'),
('JOB_ADD', 'Add Job', 1, 'Job_Mod', 'ACTIVE', 'SEEDED'),
('JOB_EDIT', 'Edit Job', 1, 'Job_Mod', 'ACTIVE', 'SEEDED'),
('JOB_DEL', 'Soft Delete Job', 1, 'Job_Mod', 'ACTIVE', 'SEEDED'),

-- Department Module Rights (Dept_Mod)
('DEPT_VIEW', 'View Departments', 1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
('DEPT_ADD', 'Add Department', 1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
('DEPT_EDIT', 'Edit Department', 1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
('DEPT_DEL', 'Soft Delete Department', 1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),

-- Admin Module Rights (Adm_Mod)
('ADM_USER', 'Admin Activate User', 1, 'Adm_Mod', 'ACTIVE', 'SEEDED');

-- Insert the missing EMP_DEL right
INSERT INTO rights (right_code, right_desc, right_value, module_code, record_status, stamp) 
VALUES ('EMP_DEL', 'Soft Delete Employee', 1, 'Emp_Mod', 'ACTIVE', 'SEEDED');

-- ============================================
--  Seed SUPERADMIN User
-- ============================================

-- Insert SUPERADMIN user
INSERT INTO "user" (email, user_type, record_status, stamp) VALUES
('jcesperanza@neu.edu.ph', 'SUPERADMIN', 'ACTIVE', 'SEEDED');

-- Give SUPERADMIN all 17 rights (right_value = 1 for each)
INSERT INTO UserModule_Rights (email, right_code, right_value)
SELECT 'jcesperanza@neu.edu.ph', right_code, 1
FROM rights;



-- Assign it to SUPERADMIN
INSERT INTO UserModule_Rights (email, right_code, right_value)
VALUES ('jcesperanza@neu.edu.ph', 'EMP_DEL', 1);


-- Also give SUPERADMIN full module access (rights_value = 1 for all modules)
INSERT INTO user_module (email, module_code, rights_value)
SELECT 'jcesperanza@neu.edu.ph', module_code, 1
FROM Module;

-- Insert your boss as SUPERADMIN
INSERT INTO "user" (email, user_type, record_status, stamp) 
VALUES ('mariaantonette.espinosa@neu.edu.ph', 'SUPERADMIN', 'ACTIVE', 'SEEDED');

-- Give her all 17 rights (right_value = 1 for each)
INSERT INTO UserModule_Rights (email, right_code, right_value)
SELECT 'mariaantonette.espinosa@neu.edu.ph', right_code, 1
FROM rights;

-- Give her full module access (rights_value = 1 for all modules)
INSERT INTO user_module (email, module_code, rights_value)
SELECT 'mariaantonette.espinosa@neu.edu.ph', module_code, 1
FROM Module;
