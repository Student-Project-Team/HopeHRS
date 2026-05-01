import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllEmployees } from '../services/employeeService';

export default function EmployeeListPage() {
  const { user } = useAuth();
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllEmployees } from '../services/employeeService';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAddEmployee, canEditEmployee, canDeleteEmployee } = useRights();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userType = user?.user_type || 'USER';

  // Wrap fetchEmployees in useCallback
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllEmployees(userType);
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userType]); // Add userType as dependency

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]); // Now fetchEmployees is stable

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllEmployees();
        setEmployees(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading employees...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => alert('Add Employee Modal - Coming in PR-02')}
          >
            + Add Employee
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sep Date</th>
              {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stamp</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No employees found</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.empno} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.empno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.lastname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.firstname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.hiredate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.sepDate || '-'}</td>
                  {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{emp.stamp || '-'}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emp.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.record_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Emp No</th>
              <th className="px-6 py-3 text-left">Last Name</th>
              <th className="px-6 py-3 text-left">First Name</th>
              <th className="px-6 py-3 text-left">Gender</th>
              <th className="px-6 py-3 text-left">Hire Date</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr 
                key={emp.empno} 
                className="border-t cursor-pointer hover:bg-gray-50" 
                onClick={() => navigate(`/employees/${emp.empno}`)}
              >
                <td className="px-6 py-4">{emp.empno}</td>
                <td className="px-6 py-4">{emp.lastname}</td>
                <td className="px-6 py-4">{emp.firstname}</td>
                <td className="px-6 py-4">{emp.gender}</td>
                <td className="px-6 py-4">{emp.hiredate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${emp.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {emp.record_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
}
