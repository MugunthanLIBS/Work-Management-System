// ============================================
// FILE: src/components/Modals/EnhancedTaskFormModal.jsx
// Shows only team members from the selected project
// ============================================
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const EnhancedTaskFormModal = ({ isOpen, onClose, onSubmit, task, projects, currentUserId, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [availableMembers, setAvailableMembers] = useState([]);
  const selectedProjectId = watch('projectId');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.project?.id || '',
        assignedToId: task.assignedTo?.id || '',
      });
      
      // Load members for the task's project
      if (task.project?.id) {
        loadProjectTeamMembers(task.project.id);
      }
    } else {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: '',
        assignedToId: '',
      });
      setAvailableMembers([]);
    }
  }, [task, reset]);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectTeamMembers(parseInt(selectedProjectId));
    } else {
      setAvailableMembers([]);
    }
  }, [selectedProjectId]);

  const loadProjectTeamMembers = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    console.log('📊 Selected Project:', project);
    
    if (!project) {
      setAvailableMembers([]);
      return;
    }

    // Get team members from project's team
    if (project.team && project.team.members) {
      console.log('👥 Team Members:', project.team.members);
      const members = Array.from(project.team.members);
      setAvailableMembers(members);
    } else {
      console.log('⚠️ No team assigned to this project');
      setAvailableMembers([]);
    }
  };

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    if (!task) {
      data.createdById = currentUserId;
    }
    console.log('📤 Submitting task data:', data);
    onSubmit(data);
  };

  const selectedProject = projects.find(p => p.id === parseInt(selectedProjectId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Task title is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                placeholder="Enter task description"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                {...register('projectId', { required: 'Project is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">Select Project</option>
                {projects && projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} {project.team ? `(${project.team.name})` : '(No Team)'}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>
              )}
              {selectedProject && !selectedProject.team && (
                <p className="text-orange-600 text-xs mt-1">
                  ⚠️ This project has no team assigned. Please assign a team to the project first.
                </p>
              )}
            </div>

            {/* Assign To - Team Members Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To {selectedProject?.team && `(${selectedProject.team.name} Members)`}
              </label>
              <select
                {...register('assignedToId')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                disabled={!selectedProjectId || availableMembers.length === 0}
              >
                <option value="">Unassigned</option>
                {availableMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              {selectedProjectId && availableMembers.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  No team members available. Assign a team to the project.
                </p>
              )}
              {!selectedProjectId && (
                <p className="text-xs text-gray-500 mt-1">
                  Select a project first
                </p>
              )}
              {selectedProjectId && availableMembers.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {availableMembers.length} team member(s) available
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                {...register('dueDate', { required: 'Due date is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Info Box */}
          {selectedProject && selectedProject.team && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-2">
                <span className="text-green-600 text-lg">ℹ️</span>
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Team Information:</p>
                  <p>Team: <strong>{selectedProject.team.name}</strong></p>
                  <p>Team Leader: <strong>{selectedProject.team.teamLeader?.name || 'Not assigned'}</strong></p>
                  <p>Members: <strong>{availableMembers.length}</strong> available for task assignment</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedTaskFormModal;