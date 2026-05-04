import { supabase } from '../lib/supabase';

/**
 * Get headcount by department
 * Returns number of active employees per department using latest job history
 */
export async function getHeadcountByDepartment() {
  try {
    // Get all active job history records with department info
    const { data, error } = await supabase
      .from('jobhistory')
      .select(`
        deptcode,
        department:deptcode ( deptname ),
        empno
      `)
      .eq('record_status', 'ACTIVE');

    if (error) throw error;

    // Count unique employees per department
    const deptMap = new Map();

    data?.forEach(record => {
      const deptCode = record.deptcode;
      const deptName = record.department?.deptname || deptCode;
      const empNo = record.empno;

      if (!deptMap.has(deptCode)) {
        deptMap.set(deptCode, {
          deptCode: deptCode,
          deptName: deptName,
          employees: new Set()
        });
      }
      
      deptMap.get(deptCode).employees.add(empNo);
    });

    // Convert to array with headcount
    const result = Array.from(deptMap.values()).map(dept => ({
      deptCode: dept.deptCode,
      deptName: dept.deptName,
      headcount: dept.employees.size
    }));

    // Sort by headcount descending (highest first)
    result.sort((a, b) => b.headcount - a.headcount);

    return result;
  } catch (error) {
    console.error('getHeadcountByDepartment error:', error);
    throw error;
  }
}

/**
 * Get salary summary by job
 * Returns MIN, MAX, AVG salary per active job
 */
export async function getSalarySummaryByJob() {
  try {
    const { data, error } = await supabase
      .from('jobhistory')
      .select(`
        jobcode,
        job:jobcode ( jobdesc ),
        salary
      `)
      .eq('record_status', 'ACTIVE')
      .not('salary', 'is', null);

    if (error) throw error;

    // Aggregate salary data by job
    const jobMap = new Map();

    data?.forEach(record => {
      const jobCode = record.jobcode;
      const jobDesc = record.job?.jobdesc || jobCode;
      const salary = parseFloat(record.salary);

      if (!jobMap.has(jobCode)) {
        jobMap.set(jobCode, {
          jobCode: jobCode,
          jobDesc: jobDesc,
          minSalary: salary,
          maxSalary: salary,
          sumSalary: 0,
          count: 0
        });
      }

      const jobData = jobMap.get(jobCode);
      jobData.minSalary = Math.min(jobData.minSalary, salary);
      jobData.maxSalary = Math.max(jobData.maxSalary, salary);
      jobData.sumSalary += salary;
      jobData.count++;
    });

    // Calculate averages
    const result = Array.from(jobMap.values()).map(job => ({
      jobCode: job.jobCode,
      jobDesc: job.jobDesc,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      avgSalary: Math.round(job.sumSalary / job.count),
      totalAssignments: job.count
    }));

    // Sort by job code
    result.sort((a, b) => a.jobCode.localeCompare(b.jobCode));

    return result;
  } catch (error) {
    console.error('getSalarySummaryByJob error:', error);
    throw error;
  }
}

/**
 * Get full job history for a specific employee
 * Returns chronological job history with job and department details
 */
export async function getEmployeeFullHistory(empno) {
  try {
    const { data, error } = await supabase
      .from('jobhistory')
      .select(`
        empno,
        jobcode,
        job:jobcode ( jobdesc ),
        deptcode,
        department:deptcode ( deptname ),
        effdate,
        salary,
        record_status,
        stamp
      `)
      .eq('empno', empno)
      .order('effdate', { ascending: true }); // Chronological order (oldest first)

    if (error) throw error;

    // Transform the data for easier use
    const history = data?.map(record => ({
      empno: record.empno,
      jobCode: record.jobcode,
      jobDesc: record.job?.jobdesc || record.jobcode,
      deptCode: record.deptcode,
      deptName: record.department?.deptname || record.deptcode,
      effectiveDate: record.effdate,
      salary: record.salary ? parseFloat(record.salary) : null,
      status: record.record_status,
      stamp: record.stamp
    })) || [];

    return history;
  } catch (error) {
    console.error('getEmployeeFullHistory error:', error);
    throw error;
  }
}

/**
 * Get all active employees for dropdown selection
 */
export async function getActiveEmployees() {
  try {
    const { data, error } = await supabase
      .from('employee')
      .select('empno, firstname, lastname')
      .eq('record_status', 'ACTIVE')
      .order('empno');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getActiveEmployees error:', error);
    throw error;
  }
}

/**
 * Get all departments for reports
 */
export async function getAllDepartmentsForReport() {
  try {
    const { data, error } = await supabase
      .from('department')
      .select('deptcode, deptname')
      .eq('record_status', 'ACTIVE')
      .order('deptcode');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getAllDepartmentsForReport error:', error);
    throw error;
  }
}

/**
 * Get all jobs for reports
 */
export async function getAllJobsForReport() {
  try {
    const { data, error } = await supabase
      .from('job')
      .select('jobcode, jobdesc')
      .eq('record_status', 'ACTIVE')
      .order('jobcode');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getAllJobsForReport error:', error);
    throw error;
  }
}

/**
 * Get combined report data (all reports in one call)
 */
export async function getAllReports() {
  try {
    const [headcount, salarySummary, employees] = await Promise.all([
      getHeadcountByDepartment(),
      getSalarySummaryByJob(),
      getActiveEmployees()
    ]);

    return {
      headcountByDepartment: headcount,
      salarySummaryByJob: salarySummary,
      activeEmployees: employees
    };
  } catch (error) {
    console.error('getAllReports error:', error);
    throw error;
  }
}
