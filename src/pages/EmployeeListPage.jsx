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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllEmployees(userType);
        setEmployees(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [userType]);

  if (loading) return <div className="p-6 text-center">Loading employees...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        {canAddEmployee() && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Add Employee
          </button>
        )}
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
              {(canEditEmployee() || canDeleteEmployee()) && <th className="px-6 py-3 text-left">Actions</th>}
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
                {(canEditEmployee() || canDeleteEmployee()) && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {canEditEmployee() && emp.record_status === 'ACTIVE' && (
                      <button className="text-blue-600 mr-2">Edit</button>
                    )}
                    {canDeleteEmployee() && emp.record_status === 'ACTIVE' && (
                      <button className="text-red-600">Delete</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
