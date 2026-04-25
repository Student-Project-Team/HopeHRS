
-- Hope, Inc. Database 
-- Fictitious Company
-- Conceptualized by JEREMIAS C. ESPERANZA - NEU CCS
-- Information Management Course

DROP TABLE employee;
DROP TABLE department;
DROP TABLE job;
DROP TABLE jobHistory;


-- Create customer table 
CREATE TABLE employee (empno VARCHAR(5) NOT NULL PRIMARY KEY, 
												lastname VARCHAR(15),  
												firstname VARCHAR(15), 
												gender CHAR(1) CONSTRAINT gender_ck CHECK (gender in ('M','F')), 
												birthdate DATE, 
												hiredate DATE, 
												sepDate DATE);

-- Insert employee records
INSERT INTO employee VALUES('00001','Smith', 'John', 'M','1985-02-20','2010-05-11', NULL);
INSERT INTO employee VALUES('00003','Smith', 'Jane', 'F','1990-05-16','2010-05-11', NULL);
INSERT INTO employee VALUES('00005','King', 'Don', 'M','1986-02-14','2010-06-23', NULL);
INSERT INTO employee VALUES('00007','Jenskin', 'Floyd', 'M','1990-02-20','2010-05-30', NULL);
INSERT INTO employee VALUES('00009','Cerudo', 'Bambie', 'F','1983-06-23','2010-05-30', NULL);
INSERT INTO employee VALUES('00011','Davis', 'Tom', 'M','1989-12-16','2010-06-30', NULL);
INSERT INTO employee VALUES('00013','Morris', 'Olive', 'F','1991-07-21','2010-06-30', NULL);
INSERT INTO employee VALUES('00015','Zulueta', 'Maggie', 'F','1990-08-03','2010-07-05', '2011-03-30');
INSERT INTO employee VALUES('00017','Celestino', 'Nelia', 'F','1984-10-24','2010-07-05', NULL);
INSERT INTO employee VALUES('00019','Esperanza', 'Nehemiah', 'M','1982-02-21','2010-07-05', '2014-04-28');
INSERT INTO employee VALUES('00021','Manchester', 'Chelie', 'F','1988-12-07','2010-07-05', NULL);
INSERT INTO employee VALUES('00023','Kline', 'Nicholas', 'M','1992-01-21','2010-07-05', '2010-12-23');
INSERT INTO employee VALUES('00025','Macapagal', 'Ivy', 'F','1992-04-30','2010-07-05', NULL);
INSERT INTO employee VALUES('00027','Blanche', 'Ernest', 'M','1986-12-21','2010-07-05', NULL);
INSERT INTO employee VALUES('00029','Chua', 'Evangeline', 'F','1989-03-10','2010-07-05', NULL);
INSERT INTO employee VALUES('00031','Lancaster', 'Greta', 'F','1987-08-17','2010-07-05', NULL);
INSERT INTO employee VALUES('00033','Parks', 'Nigel', 'M','1993-06-23','2010-07-05', NULL);
INSERT INTO employee VALUES('00035','Carlston', 'Voltaire', 'F','1985-06-12','2010-07-21', NULL);
INSERT INTO employee VALUES('00037','Silva', 'Yves', 'M','1988-09-21','2010-07-21', NULL);
INSERT INTO employee VALUES('00039','Geisert', 'William', 'M','1980-03-03','2010-07-21', NULL);
INSERT INTO employee VALUES('00041','Darwin', 'Helena', 'F','1978-11-08','2010-09-01', NULL);
INSERT INTO employee VALUES('00043','Love', 'Queen', 'F','1983-11-29','2010-09-01', NULL);
INSERT INTO employee VALUES('00045','Raven', 'Danny', 'M','1984-02-15','2010-12-03', NULL);
INSERT INTO employee VALUES('00047','Devito', 'Clint', 'M','1981-06-07','2010-12-03', NULL);
INSERT INTO employee VALUES('00049','Irving', 'Nancy', 'F','1987-09-19','2010-12-03', NULL);
INSERT INTO employee VALUES('00051','Baltimore', 'Fergie', 'F','1986-10-10','2011-01-05', NULL);
INSERT INTO employee VALUES('00053','Jones', 'Veronica', 'F','1983-05-01','2011-01-05', '2011-03-30');
INSERT INTO employee VALUES('00055','Travis', 'Ursula', 'F','1987-06-07','2011-01-05', NULL);
INSERT INTO employee VALUES('00057','Orleans', 'Sylvia', 'F','1987-01-28','2011-01-05', NULL);
INSERT INTO employee VALUES('00059','Sy', 'Alice', 'F','1984-08-13','2011-01-05', '2011-04-20');
INSERT INTO employee VALUES('00061','De Leon', 'Girlie', 'F','1983-07-27','2011-01-05', NULL);
INSERT INTO employee VALUES('00063','Grant', 'Albert', 'M','1979-05-05','2011-01-05', NULL);

-- Create DEPARTMENT
CREATE TABLE department (deptCode VARCHAR(3) NOT NULL,
												  deptName VARCHAR (20), 
												  PRIMARY KEY (deptCode)) ;

INSERT INTO department  VALUES  ('ACT', 'Accounting'),
															  ('BR1', 'Sales Branch 1'),
															  ('BR2', 'Sales Branch 2'),
															  ('EXC', 'Executive'),
															  ('HRD', 'Human Resource'),
															  ('IT', 'Information Tech'),
															  ('PAY', 'Payroll'), 
															  ('WHS', 'Warehouse');


-- Create JOB 
CREATE TABLE job (jobCode VARCHAR(4) NOT NULL PRIMARY KEY, 
									 jobDesc VARCHAR(20)) ;

-- Insert rows JOB 
INSERT INTO job VALUES('PRES','President');
INSERT INTO job VALUES('VP','Vice president');
INSERT INTO job VALUES('MGR','Manager');
INSERT INTO job VALUES('SA1','Sales Agent 1');
INSERT INTO job VALUES('SA2','Sales Agent 2');
INSERT INTO job VALUES('SPVR','Supervisor');
INSERT INTO job VALUES('CLK1','Clerk 1');
INSERT INTO job VALUES('CLK2','Clerk 2');
INSERT INTO job VALUES('PR1','Programmer 1');
INSERT INTO job VALUES('PR2','Programmer 2');
INSERT INTO job VALUES('ANYS','Analyst');
INSERT INTO job VALUES('ACCT','Accountant');
INSERT INTO job VALUES('WMAN','Warehouse man');
INSERT INTO job VALUES('HRS','HR Specialist');


-- Create jobHistory
CREATE TABLE jobHistory (empNo VARCHAR(5) NOT NULL REFERENCES employee,
												  jobCode VARCHAR(4) NOT NULL REFERENCES job, 
												  effDate DATE NOT NULL , 
												  salary DECIMAL(10,2) CONSTRAINT salary_ck 
												  CHECK (salary >= 0.0), deptCode VARCHAR(4),
												  PRIMARY KEY (empNo, jobCode,effDate), 
												  FOREIGN KEY (deptCode) REFERENCES department);

-- Insert rows jobHistory
INSERT INTO jobHistory VALUES('00001','PR1', '2010-05-11', 48000,'IT');
INSERT INTO jobHistory VALUES('00001','PR2', '2010-12-01', 50000,'IT');
INSERT INTO jobHistory VALUES('00003','PR2', '2010-05-11', 50000,'IT');
INSERT INTO jobHistory VALUES('00003','ANYS', '2010-12-01', 55000,'IT');
INSERT INTO jobHistory VALUES('00005','SA1', '2010-06-23', 36000,'BR1');
INSERT INTO jobHistory VALUES('00005','SA2', '2011-01-02', 38000,'BR1');
INSERT INTO jobHistory VALUES('00007','ANYS', '2010-05-30', 55000,'IT');
INSERT INTO jobHistory VALUES('00007','MGR', '2011-01-02', 60000,'IT');
INSERT INTO jobHistory VALUES('00007','VP', '2011-03-31', 80000,'IT');
INSERT INTO jobHistory VALUES('00009','ACCT', '2010-05-30', 50000,'ACT');
INSERT INTO jobHistory VALUES('00009','MGR', '2010-12-01', 60000,'ACT');
INSERT INTO jobHistory VALUES('00011','PRES', '2010-06-30', 100000,'EXC');
INSERT INTO jobHistory VALUES('00013','MGR', '2010-06-30', 60000,'BR1');
INSERT INTO jobHistory VALUES('00013','VP', '2011-01-02', 80000,'BR2');
INSERT INTO jobHistory VALUES('00013','VP', '2011-03-01', 80000,'BR1');
INSERT INTO jobHistory VALUES('00015','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00017','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00017','SPVR', '2011-01-12', 40000,'BR1');
INSERT INTO jobHistory VALUES('00019','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00019','SA2', '2011-01-12', 38000,'BR1');
INSERT INTO jobHistory VALUES('00021','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00021','SA2', '2011-01-12', 38000,'BR1');
INSERT INTO jobHistory VALUES('00023','MGR', '2010-07-05', 60000,'HRD');
INSERT INTO jobHistory VALUES('00025','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00027','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00027','SA2', '2011-01-12', 38000,'BR1');
INSERT INTO jobHistory VALUES('00029','SPVR', '2010-07-05', 40000,'BR1');
INSERT INTO jobHistory VALUES('00029','MGR', '2011-01-02', 60000,'BR1');
INSERT INTO jobHistory VALUES('00031','WMAN', '2010-07-05', 35000,'WHS');
INSERT INTO jobHistory VALUES('00031','WMAN', '2011-12-01', 40000,'WHS');
INSERT INTO jobHistory VALUES('00033','WMAN', '2010-07-05', 35000,'WHS');
INSERT INTO jobHistory VALUES('00035','ACCT', '2010-07-21', 50000,'PAY');
INSERT INTO jobHistory VALUES('00037','CLK1', '2010-07-21', 34000,'PAY');
INSERT INTO jobHistory VALUES('00039','CLK1', '2010-07-21', 34000,'PAY');
INSERT INTO jobHistory VALUES('00039','CLK2', '2012-06-30', 35000,'EXC');
INSERT INTO jobHistory VALUES('00041','SPVR', '2010-09-01', 40000,'WHS');
INSERT INTO jobHistory VALUES('00041','MGR', '2011-06-01', 60000,'WHS');
INSERT INTO jobHistory VALUES('00043','CLK2', '2010-09-01', 35000,'EXC');
INSERT INTO jobHistory VALUES('00043','SPVR', '2011-06-01', 35000,'EXC');
INSERT INTO jobHistory VALUES('00043','SPVR', '2011-01-12', 35000,'HRD');
INSERT INTO jobHistory VALUES('00045','SPVR', '2010-12-03', 40000,'ACT');
INSERT INTO jobHistory VALUES('00047','CLK1', '2010-12-03', 34000,'EXC');
INSERT INTO jobHistory VALUES('00047','CLK2', '2011-01-12', 35000,'HRD');
INSERT INTO jobHistory VALUES('00049','MGR', '2010-12-03', 60000,'BR2');
INSERT INTO jobHistory VALUES('00051','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00053','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00055','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00055','SA2', '2011-03-01', 38000,'BR2');
INSERT INTO jobHistory VALUES('00057','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00057','PR1', '2011-06-01', 48000,'BR2');
INSERT INTO jobHistory VALUES('00059','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00061','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00063','SA2', '2011-01-05', 38000,'BR2');
INSERT INTO jobHistory VALUES('00063','SPVR', '2011-06-01', 40000,'BR2');

select * from jobHistory;

-- ============================================
-- Add record_status and stamp to existing tables
-- ============================================

-- Add to employee (modify existing columns to match spec)
ALTER TABLE employee 
DROP COLUMN IF EXISTS record_status,
DROP COLUMN IF EXISTS stamp,
ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE',
ADD COLUMN stamp VARCHAR(60);

-- Add to job
ALTER TABLE job 
DROP COLUMN IF EXISTS record_status,
DROP COLUMN IF EXISTS stamp,
ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE',
ADD COLUMN stamp VARCHAR(60);

-- Add to department
ALTER TABLE department 
DROP COLUMN IF EXISTS record_status,
DROP COLUMN IF EXISTS stamp,
ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE',
ADD COLUMN stamp VARCHAR(60);

-- Add to jobHistory
ALTER TABLE jobHistory 
DROP COLUMN IF EXISTS record_status,
DROP COLUMN IF EXISTS stamp,
ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE',
ADD COLUMN stamp VARCHAR(60);

 								
