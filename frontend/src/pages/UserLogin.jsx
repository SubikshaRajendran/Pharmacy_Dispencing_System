import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User as UserIcon, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.role === 'admin') navigate('/admin-dashboard');
      else if (data.role === 'pharmacist') navigate('/pharmacist-dashboard');
      else navigate('/user-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-pharmacy-lime/40 text-pharmacy-dark rounded-2xl mx-auto flex items-center justify-center font-bold">
              <UserIcon className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Patient Login</h2>
            <p className="text-xs text-gray-500">Sign in to manage orders, upload prescriptions, & track delivery</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="user@mediheal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-pharmacy-dark outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:border-pharmacy-dark outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pharmacy-dark text-white font-semibold py-3 rounded-xl hover:bg-pharmacy-deep shadow-md transition disabled:opacity-50 text-xs"
            >
              {loading ? 'Signing in...' : 'Login to Patient Account'}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Don't have an account?</span>
            <Link to="/register" className="font-bold text-pharmacy-dark hover:underline flex items-center gap-1">
              Create Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserLogin;
