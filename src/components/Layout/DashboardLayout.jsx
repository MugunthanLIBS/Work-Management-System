import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 flex flex-col">
        <Header setOpen={setOpen} />

        <main className="p-6 overflow-y-auto">
          <Outlet />   {/* 🔥 THIS IS REQUIRED */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
