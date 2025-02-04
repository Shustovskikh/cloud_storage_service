import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import NotFound from './pages/NotFound/NotFound';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import UserManagement from './components/UserManagement/UserManagement';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ element, redirectTo }) => {
  const user = useSelector((state) => state.auth.user);
  return user ? element : <Navigate to={redirectTo} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} redirectTo="/login" />} />
    <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} redirectTo="/login" />} />
    <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} redirectTo="/login" />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
