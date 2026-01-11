// src/components/Layout/Header.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import {logout as logoutService} from '../../services/authService';


const Header = ({ setOpen }) => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutService();
  // API call (invalidate token / clear cookie)
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      dispatch(logout());     // Clear Redux state
    }
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <button
        className="lg:hidden text-2xl"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <h1 className="text-lg font-bold text-gray-800">
        Dashboard
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
