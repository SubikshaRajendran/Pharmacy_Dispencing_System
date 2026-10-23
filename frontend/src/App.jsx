import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Home from './pages/Home';
import OtherLogins from './pages/OtherLogins';
import DoctorLogin from './pages/DoctorLogin';
import PharmacistLogin from './pages/PharmacistLogin';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserDashboard from './pages/UserDashboard';
import UploadPrescription from './pages/UploadPrescription';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/other-logins" element={<OtherLogins />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/pharmacist-login" element={<PharmacistLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />

            <Route 
              path="/user-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload-prescription" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UploadPrescription />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pharmacist-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                  <PharmacistDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
