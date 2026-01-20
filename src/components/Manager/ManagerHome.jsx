import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../services/userService';
import { getAllProjects } from '../../services/projectService';
import { getAllTeams } from '../../services/teamService';

const ManagerHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    teamLeaders: 0,
    employees: 0,
    totalTeams: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, projects, teams] = await Promise.all([
        getAllUsers(),
        getAllProjects(),
        getAllTeams()
      ]);
      
      setStats({
        totalUsers: users.length,
        teamLeaders: users.filter(u => u.role === 'TL').length,
        employees: users.filter(u => u.role === 'EMPLOYEE').length,
        totalTeams: teams.length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
        completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600', change: '+12%' },
    { title: 'Teams', value: stats.totalTeams, icon: '👔', color: 'from-green-500 to-green-600', change: '+5%' },
    { title: 'Total Projects', value: stats.totalProjects, icon: '📊', color: 'from-purple-500 to-purple-600', change: '+18%' },
    { title: 'Active Projects', value: stats.activeProjects, icon: '🚀', color: 'from-orange-500 to-orange-600', change: '+15%' },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'completed a task', time: '2 hours ago', icon: '✅' },
    { user: 'Jane Smith', action: 'joined the team', time: '4 hours ago', icon: '👋' },
    { user: 'Mike Johnson', action: 'submitted a report', time: '6 hours ago', icon: '📄' },
    { user: 'Sarah Williams', action: 'updated project status', time: '8 hours ago', icon: '🔄' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/manager-dashboard/users')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md"
          >
            <span className="text-2xl">➕</span>
            <span className="font-semibold">Add User</span>
          </button>
          <button
            onClick={() => navigate('/manager-dashboard/teams')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
          >
            <span className="text-2xl">👥</span>
            <span className="font-semibold">Create Team</span>
          </button>
          <button
            onClick={() => navigate('/manager-dashboard/projects')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
          >
            <span className="text-2xl">📊</span>
            <span className="font-semibold">New Project</span>
          </button>
        </div>
      </div>

      {/* Recent Activities & Team Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-xl">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    <span className="font-bold">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                  👥
                </div>
                <div>
                  <p className="font-bold text-gray-800">Total Teams</p>
                  <p className="text-sm text-gray-500">Organized groups</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.totalTeams}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                  📊
                </div>
                <div>
                  <p className="font-bold text-gray-800">Total Projects</p>
                  <p className="text-sm text-gray-500">All projects</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.totalProjects}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                  ✅
                </div>
                <div>
                  <p className="font-bold text-gray-800">Completed</p>
                  <p className="text-sm text-gray-500">Successfully finished</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.completedProjects}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;