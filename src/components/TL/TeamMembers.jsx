import React from 'react';

const TeamMembers = () => {
  const members = [
    { name: 'John Doe', role: 'Developer', status: 'Active', tasks: 5 },
    { name: 'Jane Smith', role: 'Designer', status: 'Active', tasks: 3 },
    { name: 'Mike Johnson', role: 'Developer', status: 'On Leave', tasks: 2 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Team Members</h3>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                {member.name[0]}
              </div>
              <div>
                <p className="font-bold text-gray-800">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{member.tasks} tasks</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;