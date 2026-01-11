import { Routes, Route, Navigate } from 'react-router-dom';
import AuthChecker from './components/AuthChecker';
import Login from './components/Login';

import RoleLayout from './components/Layout/RoleLayout';

// Manager
import ManagerHome from './components/Manager/ManagerHome';
import Reports from './components/Manager/Reports';
import Settings from './components/Manager/Settings';
import UserManagement from './components/Manager/UserManagement';
import Teams from './components/Manager/Teams';

// TL
import TLHome from './components/TL/TLHome';
import TeamMembers from './components/TL/TeamMembers';
import Tasks from './components/TL/Tasks';
import Performance from './components/TL/Performance';

// Employee
import EmployeeHome from './components/Employee/EmployeeHome';
import MyTasks from './components/Employee/MyTasks';
import TimeTracking from './components/Employee/TimeTracking';
import Profile from './components/Employee/Profile';
import Projects from './components/Manager/Projects';
import AssignedProjects from './components/TL/AssignedProjects';

function App() {
  return (
    <AuthChecker>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* MANAGER */}
        <Route path="/manager-dashboard" element={<RoleLayout allowedRoles={['MANAGER']} />}>
          <Route index element={<ManagerHome />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="teams" element={<Teams />} />
          <Route path="projects" element={<Projects />} />
        </Route>

        {/* TL */}
        <Route path="/tl-dashboard" element={<RoleLayout allowedRoles={['TL']} />}>
          <Route index element={<TLHome />} />
          <Route path="team" element={<TeamMembers />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="projects" element={<AssignedProjects />} />
          <Route path="performance" element={<Performance />} />
        </Route>

        {/* EMPLOYEE */}
        <Route path="/employee-dashboard" element={<RoleLayout allowedRoles={['EMPLOYEE']} />}>
          <Route index element={<EmployeeHome />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="time" element={<TimeTracking />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthChecker>
  );
}

export default App;