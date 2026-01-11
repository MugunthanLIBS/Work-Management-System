import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAllTasks, createTask, updateTask, deleteTask } from '../../services/taskService';
import { getAllProjects } from '../../services/projectService';
import EnhancedTaskFormModal from '../Modals/EnhancedTaskFormModal';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        getAllTasks(),
        getAllProjects()
      ]);
      
      console.log('📊 All Projects:', projectsData);
      console.log('👤 Current User ID:', user?.id);
      
      // Filter projects where current user is team leader OR project has team with this TL
      const myProjects = projectsData.filter(p => {
        const isDirectTL = p.teamLeader?.id === user?.id;
        const isTeamTL = p.team?.teamLeader?.id === user?.id;
        console.log(`Project "${p.name}": directTL=${isDirectTL}, teamTL=${isTeamTL}`);
        return isDirectTL || isTeamTL;
      });
      
      console.log('✅ My Projects:', myProjects);
      
      // Filter tasks that belong to the TL's projects
      const myTasks = tasksData.filter(task => 
        myProjects.some(project => project.id === task.project?.id)
      );
      
      console.log('✅ My Tasks:', myTasks);
      
      setTasks(myTasks);
      setProjects(myProjects);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
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
    
    if (projectFilter !== 'ALL') {
      filtered = filtered.filter(t => t.project?.id === parseInt(projectFilter));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await createTask(taskData);
      await fetchData();
      setIsFormModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await updateTask(selectedTask.id, taskData);
      await fetchData();
      setIsFormModalOpen(false);
      setSelectedTask(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setActionLoading(true);
      await deleteTask(taskToDelete.id);
      await fetchData();
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      console.error('Error deleting task:', err);
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

  // Calculate project progress
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(t => t.project?.id === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  // Get task statistics by project
  const getProjectTaskStats = (projectId) => {
    const projectTasks = tasks.filter(t => t.project?.id === projectId);
    return {
      total: projectTasks.length,
      todo: projectTasks.filter(t => t.status === 'TODO').length,
      inProgress: projectTasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: projectTasks.filter(t => t.status === 'IN_REVIEW').length,
      completed: projectTasks.filter(t => t.status === 'COMPLETED').length,
    };
  };

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

      {/* Project Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const progress = getProjectProgress(project.id);
          const stats = getProjectTaskStats(project.id);
          return (
            <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800">{project.name}</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                  {stats.total} tasks
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-green-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded">📋 {stats.todo}</span>
                <span className="px-2 py-1 bg-blue-100 rounded">🚀 {stats.inProgress}</span>
                <span className="px-2 py-1 bg-green-100 rounded">✅ {stats.completed}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage tasks for your team members</p>
          </div>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsFormModalOpen(true);
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center gap-2 shadow-md"
          >
            <span className="text-xl">+</span> New Task
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-6xl block mb-4">📋</span>
            <p className="text-lg font-semibold">No tasks found</p>
            <p className="text-sm mt-2">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || projectFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white border-2 rounded-xl p-5 hover:shadow-md transition-all ${
                  isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : 'border-gray-200'
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
                      {isOverdue(task.dueDate, task.status) && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                          ⚠️ Overdue
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
                        <span className={`font-semibold ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Assigned to:</span>
                          <span className="text-gray-700">{task.assignedTo.name}</span>
                        </div>
                      )}
                      {!task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Status:</span>
                          <span className="text-yellow-600 font-semibold">Unassigned</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsFormModalOpen(true);
                      }}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <EnhancedTaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
        projects={projects}
        currentUserId={user?.id}
        isLoading={actionLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        userName={taskToDelete?.title}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default Tasks;