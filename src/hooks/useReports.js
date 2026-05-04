import { useState, useCallback } from 'react';
import { 
  getHeadcountByDepartment, 
  getSalarySummaryByJob, 
  getEmployeeFullHistory,
  getActiveEmployees,
  getAllDepartmentsForReport,
  getAllJobsForReport,
  getAllReports
} from '../services/reportService';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [headcountData, setHeadcountData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchHeadcountReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHeadcountByDepartment();
      setHeadcountData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalaryReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSalarySummaryByJob();
      setSalaryData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveEmployees();
      setEmployees(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDepartmentsForReport();
      setDepartments(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllJobsForReport();
      setJobs(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployeeHistory = useCallback(async (empno) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeFullHistory(empno);
      setEmployeeHistory(data);
      setSelectedEmployee(empno);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReports();
      setHeadcountData(data.headcountByDepartment);
      setSalaryData(data.salarySummaryByJob);
      setEmployees(data.activeEmployees);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearEmployeeHistory = useCallback(() => {
    setEmployeeHistory(null);
    setSelectedEmployee(null);
  }, []);

  return {
    loading,
    error,
    headcountData,
    salaryData,
    employees,
    departments,
    jobs,
    employeeHistory,
    selectedEmployee,
    fetchHeadcountReport,
    fetchSalaryReport,
    fetchEmployees,
    fetchDepartments,
    fetchJobs,
    fetchEmployeeHistory,
    fetchAllReports,
    clearEmployeeHistory
  };
}
