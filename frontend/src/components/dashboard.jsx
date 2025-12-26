import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const navigate = useNavigate();

  // Add request interceptor to handle errors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('token');
          navigate('/login');
          toast.error('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status !== 401) {
        toast.error('Error fetching tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    try {
      const { data } = await api.post('/tasks', { title: task });
      setTasks([data, ...tasks]);
      setTask('');
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.response?.status !== 401) {
        toast.error('Error adding task');
      }
    }
  };

  // Update task status
  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, {
        completed: !currentStatus,
      });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
    } catch (error) {
      console.error('Error updating task status:', error);
      if (error.response?.status !== 401) {
        toast.error('Error updating task status');
      }
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.response?.status !== 401) {
        toast.error('Error deleting task');
      }
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditText(task.title);
  };

  // Save edited task
  const saveEdit = async (taskId) => {
    if (!editText.trim()) {
      toast.error('Task cannot be empty');
      return;
    }

    try {
      const { data } = await api.put(`/tasks/${taskId}`, { title: editText });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.response?.status !== 401) {
        toast.error('Error updating task');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        {/* <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="text-red-600 hover:text-red-800"
        >
          Logout
        </button> */}
      </div>
      
      {/* Add Task Form */}
      <form onSubmit={addTask} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={!task.trim()}
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks yet. Add one above!</p>
        ) : (
          tasks.map((taskItem) => (
            <div
              key={taskItem._id}
              className={`p-4 border rounded-lg flex items-center justify-between ${
                taskItem.completed ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={taskItem.completed || false}
                  onChange={() => toggleComplete(taskItem._id, taskItem.completed)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                
                {editingTask === taskItem._id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEdit(taskItem._id);
                      } else if (e.key === 'Escape') {
                        setEditingTask(null);
                      }
                    }}
                    className="flex-1 p-1 border rounded"
                    autoFocus
                  />
                ) : (
                  <span
                    className={`flex-1 ${
                      taskItem.completed ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                    onDoubleClick={() => startEditing(taskItem)}
                  >
                    {taskItem.title}
                  </span>
                )}
              </div>

              <div className="flex space-x-3">
                {editingTask === taskItem._id ? (
                  <>
                    <button
                      onClick={() => saveEdit(taskItem._id)}
                      className="text-green-600 hover:text-green-800 px-2 py-1"
                      disabled={!editText.trim()}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(taskItem)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(taskItem._id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;