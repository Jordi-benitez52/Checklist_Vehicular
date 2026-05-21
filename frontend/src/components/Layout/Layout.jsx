import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../Toast';
import './Layout.css';

const Layout = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header title="Dashboard" />
        <main className="main-content">
          <Outlet context={{ showToast }} />
        </main>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Layout;