// ============================================
// FILE: src/components/Modals/UpdateTaskModal.jsx
// ============================================
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const UpdateTaskModal = ({ isOpen, onClose, onSubmit, task, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.project?.id,
        assignedToId: task.assignedTo?.id,
      });
    }
  }, [task, reset]);

  if (!isOpen) return null;

  const selectedStatus = watch('status');

  const getStatusInfo = (status) => {
    const statusInfo = {
      TODO: {
        color: 'gray',
        icon: '📋',
        description: 'Task is planned but not started yet'
      },
      IN_PROGRESS: {
        color: 'blue',
        icon: '🚀',
        description: 'Currently working on this task'
      },
      IN_REVIEW: {
        color: 'purple',
        icon: '👀',
        description: 'Task completed and awaiting review'
      },
      COMPLETED: {
        color: 'green',
        icon: '✅',
        description: 'Task successfully completed'
      },
      CANCELLED: {
        color: 'red',
        icon: '❌',
        description: 'Task has been cancelled'
      }
    };
    return statusInfo[status] || statusInfo.TODO;
  };

  const currentStatusInfo = getStatusInfo(selectedStatus || task?.status);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Update Task Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Task Information Display */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-2">{task?.title}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Project:</span> {task?.project?.name}</p>
            <p><span className="font-medium">Due Date:</span> {formatDate(task?.dueDate)}</p>
            <p><span className="font-medium">Priority:</span> <span className="font-semibold text-orange-600">{task?.priority}</span></p>
            {task?.createdBy && (
              <p><span className="font-medium">Assigned by:</span> {task?.createdBy.name}</p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Status Display */}
          <div className={`bg-${currentStatusInfo.color}-50 border-2 border-${currentStatusInfo.color}-200 rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{currentStatusInfo.icon}</span>
              <div>
                <p className="font-bold text-gray-800">
                  {selectedStatus ? selectedStatus.replace('_', ' ') : 'Current Status'}
                </p>
                <p className="text-sm text-gray-600">{currentStatusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Update Status *
            </label>
            <div className="grid grid-cols-1 gap-3">
              <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
                <input
                  type="radio"
                  value="TODO"
                  {...register('status', { required: 'Please select a status' })}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">📋</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">To Do</p>
                  <p className="text-xs text-gray-500">Task not started yet</p>
                </div>
              </label>

              <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
                <input
                  type="radio"
                  value="IN_PROGRESS"
                  {...register('status', { required: 'Please select a status' })}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">🚀</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">In Progress</p>
                  <p className="text-xs text-gray-500">Currently working on this</p>
                </div>
              </label>

              <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  value="IN_REVIEW"
                  {...register('status', { required: 'Please select a status' })}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">👀</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">In Review</p>
                  <p className="text-xs text-gray-500">Waiting for review/approval</p>
                </div>
              </label>

              <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition">
                <input
                  type="radio"
                  value="COMPLETED"
                  {...register('status', { required: 'Please select a status' })}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">✅</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Completed</p>
                  <p className="text-xs text-gray-500">Task successfully finished</p>
                </div>
              </label>
            </div>
            {errors.status && (
              <p className="text-red-500 text-sm mt-2">{errors.status.message}</p>
            )}
          </div>

          {/* Task Details (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Task Description:</h4>
            <p className="text-gray-600 text-sm">
              {task?.description || 'No description provided'}
            </p>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <span className="text-yellow-600 text-lg">💡</span>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Note:</p>
                <p>Only the status can be updated. If you need to modify other details, please contact your team leader.</p>
              </div>
            </div>
          </div>

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
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Updating...
                </span>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskModal;