import React from 'react';

const Reports = () => {
  const reports = [
    { title: 'Monthly Performance', date: 'Jan 2026', status: 'Completed', icon: '📊' },
    { title: 'Team Productivity', date: 'Dec 2025', status: 'In Progress', icon: '📈' },
    { title: 'Project Overview', date: 'Nov 2025', status: 'Completed', icon: '📋' },
    { title: 'Financial Report', date: 'Oct 2025', status: 'Completed', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center text-2xl">
                {report.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {report.status}
              </span>
            </div>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;