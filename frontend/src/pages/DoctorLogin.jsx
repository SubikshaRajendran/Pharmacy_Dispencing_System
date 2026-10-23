import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../services/api';
import { Stethoscope, Lock, KeyRound, AlertCircle } from 'lucide-react';

const DoctorLogin = () => {
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal for forced password change on first login
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');

  const { doctorLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await doctorLogin(doctorId, password);
      if (data.requiresPasswordReset) {
        setShowPasswordChangeModal(true);
      } else {
        navigate('/doctor-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Doctor ID or Password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (newPassword !== confirmPassword) {
      setModalError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters long');
      return;
    }

    try {
      await API.post('/auth/doctor-change-password', {
        currentPassword: password,
        newPassword
      });
      setShowPasswordChangeModal(false);
      navigate('/doctor-dashboard');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center font-bold">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Doctor Portal Login</h2>
            <p className="text-xs text-gray-500">
              Enter your assigned Doctor ID and password to access your practitioner portal
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Doctor ID</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. doc123"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:border-blue-600 outline-none"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:border-blue-600 outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-50 text-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In as Doctor'}
            </button>
          </form>

        </div>
      </main>

      {/* Forced Password Reset Modal for First Login */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <KeyRound className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">First-Time Login Security</h3>
              <p className="text-xs text-gray-500">Please change your initial demonstration password before proceeding.</p>
            </div>

            {modalError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-medium">{modalError}</p>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 text-xs transition"
              >
                Update Password & Continue
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DoctorLogin;
