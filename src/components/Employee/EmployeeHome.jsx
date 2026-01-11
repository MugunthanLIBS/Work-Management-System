import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllTasks } from '../../services/taskService';

const EmployeeHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const allTasks = await getAllTasks();
      const myTasks = allTasks.filter(task => task.assignedTo?.id === user?.id);
      
      const overdue = myTasks.filter(t => 
        t.status !== 'COMPLETED' && 
        t.status !== 'CANCELLED' && 
        new Date(t.dueDate) < new Date()
      );

      const completed = myTasks.filter(t => t.status === 'COMPLETED').length;
      const total = myTasks.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Get upcoming tasks (next 7 days, not completed)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = myTasks
        .filter(t => {
          const dueDate = new Date(t.dueDate);
          return t.status !== 'COMPLETED' && 
                 t.status !== 'CANCELLED' && 
                 dueDate >= today && 
                 dueDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      setStats({
        totalTasks: myTasks.length,
        todoTasks: myTasks.filter(t => t.status === 'TODO').length,
        inProgressTasks: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
        completedTasks: completed,
        overdueTasks: overdue.length,
        completionRate: completionRate,
      });
      setUpcomingTasks(upcoming);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const myStats = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: '📋', color: 'from-blue-500 to-blue-600', change: `${stats.completionRate}% done` },
    { title: 'To Do', value: stats.todoTasks, icon: '📝', color: 'from-gray-500 to-gray-600', change: 'Pending' },
    { title: 'In Progress', value: stats.inProgressTasks, icon: '🚀', color: 'from-blue-500 to-blue-600', change: 'Active' },
    { title: 'Completed', value: stats.completedTasks, icon: '✅', color: 'from-green-500 to-green-600', change: 'Done' },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-blue-100">Here's your task overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {myStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className="text-blue-600 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {stats.overdueTasks > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-800">
                You have {stats.overdueTasks} overdue task{stats.overdueTasks !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600">Please update your task status or contact your team leader</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/employee-dashboard/tasks')}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              <span className="text-2xl">📋</span>
              <div className="text-left">
                <p className="font-semibold">View My Tasks</p>
                <p className="text-xs text-blue-100">See all assigned tasks</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/employee-dashboard/time')}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
            >
              <span className="text-2xl">⏰</span>
              <div className="text-left">
                <p className="font-semibold">Time Tracking</p>
                <p className="text-xs text-purple-100">Log your hours</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/employee-dashboard/profile')}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <p className="font-semibold">My Profile</p>
                <p className="text-xs text-green-100">Update your information</p>
              </div>
            </button>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks (Next 7 Days)</h3>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-sm">No upcoming tasks in the next week</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate('/employee-dashboard/tasks')}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{task.project?.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Task Completion Rate</span>
              <span className="font-bold text-green-600">{stats.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalTasks}</p>
              <p className="text-xs text-gray-500">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.inProgressTasks}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;