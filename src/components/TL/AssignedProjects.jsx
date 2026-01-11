import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAllProjects } from '../../services/projectService';

const AssignedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      const allProjects = await getAllProjects();
      
      console.log('📊 All Projects:', allProjects);
      console.log('👤 Current User ID:', user?.id);
      
      // Filter projects where:
      // 1. Current user is directly assigned as teamLeader, OR
      // 2. Current user is the team leader of the assigned team
      const myProjects = allProjects.filter(p => {
        const isDirectTL = p.teamLeader?.id === user?.id;
        const isTeamTL = p.team?.teamLeader?.id === user?.id;
        
        console.log(`Project: "${p.name}"`);
        console.log(`  - Direct TL (teamLeader field): ${isDirectTL} (${p.teamLeader?.id})`);
        console.log(`  - Team TL (team.teamLeader): ${isTeamTL} (${p.team?.teamLeader?.id})`);
        console.log(`  - Team Name: ${p.team?.name || 'No team'}`);
        
        return isDirectTL || isTeamTL;
      });
      
      console.log('✅ My Projects:', myProjects);
      console.log('📊 Total Projects Found:', myProjects.length);
      
      setProjects(myProjects);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('❌ Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
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
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Assigned Projects</h2>
          <p className="text-gray-600 text-sm mt-1">Projects where you are the team leader</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-6xl block mb-4">📂</span>
            <p className="text-lg font-semibold">No projects assigned</p>
            <p className="text-sm mt-2">You haven't been assigned to any projects yet</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Debug Info:</p>
              <p>User ID: {user?.id}</p>
              <p>User Name: {user?.name}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border-2 border-green-100 rounded-xl p-6 hover:shadow-lg transition-all hover:border-green-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1 mr-2">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getPriorityBadge(project.priority)}`}>
                    {project.priority}
                  </span>
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
                  
                  {/* Show completion percentage if available */}
                  {project.completionPercentage !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Progress:</span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${project.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">{project.completionPercentage}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Budget:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Timeline:</span>
                    <span className="text-gray-700 text-xs">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>
                  
                  {/* Show team info */}
                  {project.team && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Team:</span>
                      <span className="text-gray-700 font-semibold">{project.team.name}</span>
                    </div>
                  )}
                  
                  {project.manager && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Manager:</span>
                      <span className="text-gray-700">{project.manager.name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Project ID: {project.id}</span>
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <span>👤</span> Team Leader
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <span>Total assigned projects: <strong>{projects.length}</strong></span>
          {projects.length > 0 && (
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                Active: {projects.filter(p => p.status === 'IN_PROGRESS').length}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-semibold">
                Completed: {projects.filter(p => p.status === 'COMPLETED').length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedProjects;