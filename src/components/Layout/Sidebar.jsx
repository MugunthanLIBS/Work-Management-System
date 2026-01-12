// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ open, setOpen }) => {
  const role = useSelector((state) => state.auth.role);

  const menus = {
    MANAGER: [
      { name: 'Dashboard', path: '/manager-dashboard' },
      { name: 'Users', path: '/manager-dashboard/users' },
      { name: 'Teams', path: '/manager-dashboard/teams' },
      { name: 'Projects', path: '/manager-dashboard/projects' },
      { name: 'Reports', path: '/manager-dashboard/reports' },
      { name: 'Settings', path: '/manager-dashboard/settings' },

    ],
    TL: [
      { name: 'Dashboard', path: '/tl-dashboard' },
      { name: 'Team', path: '/tl-dashboard/team' },
      { name: 'Tasks', path: '/tl-dashboard/tasks' },
      { name: 'Performance', path: '/tl-dashboard/performance' },
      { name: 'Projects', path: '/tl-dashboard/projects' },
    ],
    EMPLOYEE: [
      { name: 'Dashboard', path: '/employee-dashboard' },
      { name: 'My Tasks', path: '/employee-dashboard/tasks' },
      { name: 'Time Tracking', path: '/employee-dashboard/time' },
      { name: 'Profile', path: '/employee-dashboard/profile' },
    ],
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static z-50 w-64 bg-white shadow-xl h-full transform transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-6 text-xl font-bold text-indigo-600">
          CompanyHub
        </div>

        <nav className="px-4 space-y-2">
          {menus[role]?.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg font-medium transition
                 ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-indigo-100'}`
              }
              onClick={() => setOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
