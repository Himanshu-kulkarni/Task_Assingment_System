import { createContext, useContext, useState, useCallback } from 'react';
import { departmentService } from '../services/departmentService';
import { extractApiError } from '../utils/helpers';

const DepartmentContext = createContext(null);

export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [currentDept, setCurrentDept] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await departmentService.getDepartments();
      setDepartments(data);
      return data;
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async (deptId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await departmentService.getDepartmentMembers(deptId);
      setMembers(data);
      return data;
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createDepartment = async (deptData) => {
    const { data } = await departmentService.createDepartment(deptData);
    setDepartments((prev) => [...prev, data]);
    return data;
  };

  const assignUser = async (deptId, userId) => {
    const { data } = await departmentService.assignUser(deptId, userId);
    return data;
  };

  return (
    <DepartmentContext.Provider value={{
      departments, currentDept, members, loading, error,
      setCurrentDept, fetchDepartments, fetchMembers,
      createDepartment, assignUser,
    }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartments = () => {
  const ctx = useContext(DepartmentContext);
  if (!ctx) throw new Error('useDepartments must be inside DepartmentProvider');
  return ctx;
};
