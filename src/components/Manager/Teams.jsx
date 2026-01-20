import React, { useState, useEffect } from 'react';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '../../services/teamService';
import TeamFormModal from '../Modals/TeamFormModal';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [teams, searchTerm]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await getAllTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTeams = () => {
    let filtered = teams;
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teamLeader?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTeams(filtered);
  };

  const handleCreateTeam = async (teamData) => {
    try {
      setActionLoading(true);
      await createTeam(teamData);
      await fetchTeams();
      setIsFormModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
      console.error('Error creating team:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      setActionLoading(true);
      await updateTeam(selectedTeam.id, teamData);
      await fetchTeams();
      setIsFormModalOpen(false);
      setSelectedTeam(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update team');
      console.error('Error updating team:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      setActionLoading(true);
      setDeleteError(null);
      await deleteTeam(teamToDelete.id);
      await fetchTeams();
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete team';
      setDeleteError(errorMessage);
      console.error('Error deleting team:', err);
      
      if (!errorMessage.includes('assigned to') && !errorMessage.includes('Cannot delete')) {
        setError(errorMessage);
        setIsDeleteModalOpen(false);
        setTeamToDelete(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (team) => {
    setTeamToDelete(team);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
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
            <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
            <p className="text-gray-600 text-sm mt-1">Create and manage teams</p>
          </div>
          <button
            onClick={() => {
              setSelectedTeam(null);
              setIsFormModalOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition flex items-center gap-2 shadow-md"
          >
            <span className="text-xl">+</span> Create Team
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Teams Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-6xl block mb-4">👥</span>
            <p className="text-lg font-semibold">No teams found</p>
            <p className="text-sm mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Create your first team to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                    {team.memberCount} members
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {team.description || 'No description provided'}
                </p>

                <div className="space-y-2 mb-4">
                  {team.teamLeader && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Team Leader:</span>
                      <span className="text-gray-700 font-semibold">{team.teamLeader.name}</span>
                    </div>
                  )}
                </div>

                {/* Team Members List */}
                {team.members && team.members.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Members:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(team.members).slice(0, 3).map((member) => (
                        <span
                          key={member.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {member.name}
                        </span>
                      ))}
                      {team.memberCount > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{team.memberCount - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsFormModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(team)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          Showing {filteredTeams.length} of {teams.length} teams
        </div>
      </div>
<TeamFormModal
  isOpen={isFormModalOpen}
  onClose={() => {
    setIsFormModalOpen(false);
    setSelectedTeam(null);
    // Optional: add a small delay to ensure form is reset
    setTimeout(() => {}, 100);
  }}
  onSubmit={selectedTeam ? handleUpdateTeam : handleCreateTeam}
  team={selectedTeam}
  isLoading={actionLoading}
/>

      <DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  onClose={() => {
    setIsDeleteModalOpen(false);
    setTeamToDelete(null);
    setDeleteError(null);
  }}
  onConfirm={handleDeleteTeam}
  itemName={teamToDelete?.name}
  itemType="team"
  isLoading={actionLoading}
  error={deleteError}
/>
    </div>
  );
};

export default Teams;