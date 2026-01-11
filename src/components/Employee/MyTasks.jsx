import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAllTasks, updateTask } from '../../services/taskService';
import UpdateTaskModal from '../Modals/UpdateTaskModal';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('🔍 MyTasks: Component mounted/updated');
    console.log('👤 Current user from Redux:', user);
    console.log('🆔 User ID:', user?.id);
    console.log('📧 User Email:', user?.email);
    console.log('👤 User Name:', user?.name);
    
    if (user?.id) {
      fetchMyTasks();
    } else {
      console.log('❌ MyTasks: User ID is missing, cannot fetch tasks');
    }
  }, [user?.id]); // Only fetch when user.id changes

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching all tasks...');
      const allTasks = await getAllTasks();
      console.log('✅ All tasks received:', allTasks);
      console.log('📊 Total tasks count:', allTasks.length);
      
      // Log each task's assignedTo info
      allTasks.forEach((task, index) => {
        console.log(`Task ${index + 1}:`, {
          id: task.id,
          title: task.title,
          assignedTo: task.assignedTo,
          assignedToId: task.assignedTo?.id,
        });
      });
      
      console.log('🔍 Current user ID for filtering:', user?.id);
      
      // Filter tasks assigned to current employee
      const myTasks = allTasks.filter(task => {
        const isAssigned = task.assignedTo?.id === user?.id;
        console.log(`Task "${task.title}": assignedTo.id=${task.assignedTo?.id}, user.id=${user?.id}, isAssigned=${isAssigned}`);
        return isAssigned;
      });
      
      console.log('✅ My tasks after filtering:', myTasks);
      console.log('📊 My tasks count:', myTasks.length);
      
      setTasks(myTasks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('❌ Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTasks(filtered);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await updateTask(selectedTask.id, taskData);
      await fetchMyTasks();
      setIsUpdateModalOpen(false);
      setSelectedTask(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      IN_REVIEW: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ');
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate, status) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    };
  };

  const stats = getTaskStats();

  // Show loading if user is not loaded yet
  if (!user || !user.id) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <p className="text-gray-500 text-xs font-medium">To Do</p>
          <p className="text-2xl font-bold text-gray-800">{stats.todo}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs font-medium">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-gray-500 text-xs font-medium">In Review</p>
          <p className="text-2xl font-bold text-purple-600">{stats.inReview}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-xs font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-xs font-medium">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Assigned Tasks</h2>
          <p className="text-gray-600 text-sm mt-1">Tasks assigned to you</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Tasks Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-6xl block mb-4">📋</span>
            <p className="text-lg font-semibold">No tasks found</p>
            <p className="text-sm mt-2">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'You have no assigned tasks at the moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const daysRemaining = getDaysRemaining(task.dueDate, task.status);
              const overdue = isOverdue(task.dueDate, task.status);
              
              return (
                <div
                  key={task.id}
                  className={`bg-white border-2 rounded-xl p-5 hover:shadow-md transition-all ${
                    overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        {overdue && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                            ⚠️ Overdue
                          </span>
                        )}
                        {!overdue && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                            Due in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {task.description || 'No description provided'}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Project:</span>
                          <span className="text-gray-700 font-semibold">{task.project?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Due:</span>
                          <span className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        {task.createdBy && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">Created by:</span>
                            <span className="text-gray-700">{task.createdBy.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setIsUpdateModalOpen(true);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-md"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          {filteredTasks.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Completion Rate: <span className="font-bold text-blue-600">
                  {tasks.length > 0 ? Math.round((stats.completed / tasks.length) * 100) : 0}%
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <UpdateTaskModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        task={selectedTask}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default MyTasks;