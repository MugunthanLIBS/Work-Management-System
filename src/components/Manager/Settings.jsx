import React from 'react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" defaultValue="CompanyHub Inc." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-gray-700">Receive email notifications</span>
            </label>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;