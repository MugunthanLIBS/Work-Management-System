import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllTasks } from '../../services/taskService';
import { getAllProjects } from '../../services/projectService';

const TLHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    myProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [allTasks, allProjects] = await Promise.all([
        getAllTasks(),
        getAllProjects()
      ]);
      
      console.log('🏠 TLHome - All Projects:', allProjects);
      console.log('👤 TLHome - User ID:', user?.id);
      
      // SAME FILTERING LOGIC as AssignedProjects
      const myProjects = allProjects.filter(p => {
        const isDirectTL = p.teamLeader?.id === user?.id;
        const isTeamTL = p.team?.teamLeader?.id === user?.id;
        console.log(`TLHome - Project "${p.name}": directTL=${isDirectTL}, teamTL=${isTeamTL}`);
        return isDirectTL || isTeamTL;
      });
      
      console.log('✅ TLHome - My Projects:', myProjects);
      
      // Filter tasks that belong to TL's projects
      const myTasks = allTasks.filter(task => 
        myProjects.some(project => project.id === task.project?.id)
      );
      
      setStats({
        myProjects: myProjects.length,
        totalTasks: myTasks.length,
        completedTasks: myTasks.filter(t => t.status === 'COMPLETED').length,
        pendingTasks: myTasks.filter(t => t.status === 'TODO').length,
        inProgressTasks: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const teamStats = [
    { title: 'My Projects', value: stats.myProjects, icon: '📁', color: 'from-green-500 to-green-600', change: '+8%' },
    { title: 'Total Tasks', value: stats.totalTasks, icon: '✅', color: 'from-blue-500 to-blue-600', change: '+12%' },
    { title: 'Completed', value: stats.completedTasks, icon: '🎯', color: 'from-purple-500 to-purple-600', change: '+15%' },
    { title: 'In Progress', value: stats.inProgressTasks, icon: '🚀', color: 'from-orange-500 to-orange-600', change: '+5%' },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'completed task "API Integration"', time: '1 hour ago', icon: '✅' },
    { user: 'Jane Smith', action: 'started working on "UI Design"', time: '3 hours ago', icon: '🎨' },
    { user: 'Mike Johnson', action: 'submitted code review', time: '5 hours ago', icon: '👨‍💻' },
    { user: 'Sarah Williams', action: 'updated task status', time: '6 hours ago', icon: '🔄' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamStats.map((stat, index) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/tl-dashboard/tasks')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
          >
            <span className="text-2xl">➕</span>
            <span className="font-semibold">New Task</span>
          </button>
          <button
            onClick={() => navigate('/tl-dashboard/projects')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          >
            <span className="text-2xl">📁</span>
            <span className="font-semibold">My Projects</span>
          </button>
          <button
            onClick={() => navigate('/tl-dashboard/team')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
          >
            <span className="text-2xl">👥</span>
            <span className="font-semibold">Team</span>
          </button>
          <button
            onClick={() => navigate('/tl-dashboard/performance')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          >
            <span className="text-2xl">📊</span>
            <span className="font-semibold">Performance</span>
          </button>
        </div>
      </div>

      {/* Recent Activities & Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-xl">
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

        {/* Task Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Task Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-white text-xl">
                  📋
                </div>
                <div>
                  <p className="font-bold text-gray-800">To Do</p>
                  <p className="text-sm text-gray-500">Pending tasks</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-600">{stats.pendingTasks}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                  🚀
                </div>
                <div>
                  <p className="font-bold text-gray-800">In Progress</p>
                  <p className="text-sm text-gray-500">Active tasks</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                  ✅
                </div>
                <div>
                  <p className="font-bold text-gray-800">Completed</p>
                  <p className="text-sm text-gray-500">Finished tasks</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.completedTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TLHome;