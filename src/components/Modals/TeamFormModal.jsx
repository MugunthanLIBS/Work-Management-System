import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getAllUsers } from '../../services/userService';

const TeamFormModal = ({ isOpen, onClose, onSubmit, team, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (team) {
      const memberIds = team.members ? team.members.map(m => m.id) : [];
      setSelectedMembers(memberIds);
      reset({
        name: team.name,
        description: team.description,
        teamLeaderId: team.teamLeader?.id || '',
        memberIds: memberIds,
      });
    } else {
      setSelectedMembers([]);
      reset({
        name: '',
        description: '',
        teamLeaderId: '',
        memberIds: [],
      });
    }
  }, [team, reset]);

  const fetchUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      const tls = allUsers.filter(u => u.role === 'TL');
      const emps = allUsers.filter(u => u.role === 'EMPLOYEE' || u.role === 'TL');
      setTeamLeaders(tls);
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  if (!isOpen) return null;

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleFormSubmit = (data) => {
    data.memberIds = selectedMembers;
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {team ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Team name is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter team name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter team description"
            />
          </div>

          {/* Team Leader */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Leader *
            </label>
            <select
              {...register('teamLeaderId', { required: 'Team leader is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">Select Team Leader</option>
              {teamLeaders.map(tl => (
                <option key={tl.id} value={tl.id}>
                  {tl.name} ({tl.email})
                </option>
              ))}
            </select>
            {errors.teamLeaderId && (
              <p className="text-red-500 text-sm mt-1">{errors.teamLeaderId.message}</p>
            )}
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members ({selectedMembers.length} selected)
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
              {employees.length === 0 ? (
                <p className="text-gray-500 text-sm">No employees available</p>
              ) : (
                <div className="space-y-2">
                  {employees.map(emp => (
                    <label
                      key={emp.id}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(emp.id)}
                        onChange={() => handleMemberToggle(emp.id)}
                        className="mr-3 h-4 w-4 text-indigo-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email} - {emp.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
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
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : (
                team ? 'Update Team' : 'Create Team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamFormModal;