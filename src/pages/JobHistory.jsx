import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JobHistory = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/employees', { replace: true });
  }, [navigate]);

  return (
    <div className="p-4 flex items-center justify-center text-slate-500">
      Redirecting to Employees...
    </div>
  );
};

export default JobHistory;