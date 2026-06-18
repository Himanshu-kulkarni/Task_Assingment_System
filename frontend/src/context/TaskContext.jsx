import { createContext, useContext, useState, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { extractApiError } from '../utils/helpers';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await taskService.getMyTasks();
      setMyTasks(data);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCreatedTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await taskService.getCreatedByMe();
      setCreatedTasks(data);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await taskService.getTask(taskId);
      setCurrentTask(data);
      return data;
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    const { data } = await taskService.createTask(taskData);
    return data;
  };

  const updateStatus = async (taskId, status) => {
    const { data } = await taskService.updateTaskStatus(taskId, status);
    setCurrentTask(data);
    setMyTasks((prev) => prev.map((t) => (t.task_id === taskId ? data : t)));
    return data;
  };

  const deleteTask = async (taskId) => {
    await taskService.deleteTask(taskId);
    setMyTasks((prev) => prev.filter((t) => t.task_id !== taskId));
    setCreatedTasks((prev) => prev.filter((t) => t.task_id !== taskId));
  };

  return (
    <TaskContext.Provider value={{
      myTasks, createdTasks, currentTask, loading, error,
      fetchMyTasks, fetchCreatedTasks, fetchTask,
      createTask, updateStatus, deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be inside TaskProvider');
  return ctx;
};
