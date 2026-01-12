import React from 'react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName,
  itemType = 'item',
  isLoading = false,
  error = null
}) => {
  if (!isOpen) return null;

  // Simple guidance based on common error patterns
  const getGuidanceFromError = (errorMsg) => {
    if (!errorMsg) return null;
    
    const lowerError = errorMsg.toLowerCase();
    
    if (lowerError.includes('tasks') && lowerError.includes('project')) {
      return {
        title: 'Project has tasks assigned',
        steps: [
          'Go to Task Management',
          'Delete or reassign tasks from this project',
          'Try deleting the project again'
        ]
      };
    }
    
    if (lowerError.includes('assigned') && lowerError.includes('project')) {
      return {
        title: 'Team is assigned to projects',
        steps: [
          'Go to Project Management',
          'Unassign this team from projects',
          'Try deleting the team again'
        ]
      };
    }
    
    if (lowerError.includes('dependencies')) {
      return {
        title: 'Task has dependencies',
        steps: [
          'Check task dependencies',
          'Remove or update dependent tasks',
          'Try deleting the task again'
        ]
      };
    }
    
    return null;
  };

  const guidance = getGuidanceFromError(error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {error ? 'Cannot Delete' : 'Confirm Deletion'}
          </h3>
          <p className="text-sm text-gray-500">
            {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Management
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Deletion Blocked</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
            
            {/* Show guidance if available */}
            {guidance && (
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-yellow-800 text-sm font-medium mb-2">{guidance.title}:</p>
                <ul className="text-yellow-800 text-sm space-y-1">
                  {guidance.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Item info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="capitalize">{itemType}:</span>{' '}
                <span className="font-semibold text-gray-800">{itemName}</span>
              </p>
            </div>
          </div>
        )}
        
        {/* Normal confirmation message */}
        {!error && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-800">"{itemName}"</span>?
              </p>
              <p className="text-sm text-gray-500">
                This {itemType} will be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
          >
            {error ? 'Close' : 'Cancel'}
          </button>
          
          {!error && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;