import React, { useState, useEffect } from 'react';
import { getAllProjects, createProject, updateProject, deleteProject } from '../../services/projectService';
import ProjectFormModal from '../Modals/ProjectFormModal';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(p => p.priority === priorityFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (projectData) => {
    try {
      setActionLoading(true);
      await createProject(projectData);
      await fetchProjects();
      setIsFormModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      setActionLoading(true);
      await updateProject(selectedProject.id, projectData);
      await fetchProjects();
      setIsFormModalOpen(false);
      setSelectedProject(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
      console.error('Error updating project:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      console.log("Delete Confirm: ", projectToDelete.id);
      setActionLoading(true);
      setDeleteError(null);
      await deleteProject(projectToDelete.id);
      await fetchProjects();
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete project';
      setDeleteError(errorMessage);
      console.error('Error deleting project:', err);
      
      if (!errorMessage.includes('existing tasks') && !errorMessage.includes('Cannot delete')) {
        setError(errorMessage);
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (project) => {
    setProjectToDelete(project);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      PLANNING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
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
      CRITICAL: 'bg-red-100 text-red-800',
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

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage and track all your projects</p>
          </div>
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsFormModalOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition flex items-center gap-2 shadow-md"
          >
            <span className="text-xl">+</span> New Project
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-6xl block mb-4">📂</span>
            <p className="text-lg font-semibold">No projects found</p>
            <p className="text-sm mt-2">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1 mr-2">
                    {project.name}
                  </h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                  {project.description || 'No description provided'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Budget:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Duration:</span>
                    <span className="text-gray-700 text-xs">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>
                  {project.teamLeader && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Team Leader:</span>
                      <span className="text-gray-700">{project.teamLeader.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsFormModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(project)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredProjects.length} of {projects.length} projects</span>
          {filteredProjects.length > 0 && (
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        project={selectedProject}
        isLoading={actionLoading}
      />

      <DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  onClose={() => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
    setDeleteError(null);
  }}
  onConfirm={handleDeleteProject}
  itemName={projectToDelete?.name}
  itemType="project"
  isLoading={actionLoading}
  error={deleteError}
/>
    </div>
  );
};

export default Projects;