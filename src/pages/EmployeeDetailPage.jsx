import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../services/employeeService';

export default function EmployeeDetailPage() {
  const { empno } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const empData = await getEmployeeById(empno);
        setEmployee(empData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (empno) {
      fetchData();
    }
  }, [empno]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error || !employee) return <div className="p-6 text-red-600">Error: {error || 'Employee not found'}</div>;

  return (
    <div>
      <button 
        onClick={() => navigate('/employees')} 
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Employees
      </button>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          {employee.firstname} {employee.lastname}
        </h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Emp No:</strong> {employee.empno}</p>
            <p><strong>Gender:</strong> {employee.gender}</p>
            <p><strong>Birth Date:</strong> {employee.birthdate}</p>
          </div>
          <div>
            <p><strong>Hire Date:</strong> {employee.hiredate}</p>
            <p><strong>Separation Date:</strong> {employee.sepDate || '-'}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                employee.record_status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.record_status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
