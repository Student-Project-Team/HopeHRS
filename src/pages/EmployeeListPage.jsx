import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllEmployees } from '../services/employeeService';

export default function EmployeeListPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userType = user?.user_type || 'USER';

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log('Fetching employees for userType:', userType);
        
        const data = await getAllEmployees(userType);
        console.log('Employees data:', data);
        
        setEmployees(data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [userType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Loading employees...</p>
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

  if (employees.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        No employees found. Total in DB: 33 but none returned?
      </div>
    );
  }

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emp No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sep Date</th>
              {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stamp</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr 
                key={emp.empno} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = `/employees/${emp.empno}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.empno}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.lastname}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.firstname}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.hiredate}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.sepDate || '-'}</td>
                {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                  <td className="px-6 py-4 text-sm text-gray-400">{emp.stamp || '-'}</td>
                )}
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    emp.record_status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
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
