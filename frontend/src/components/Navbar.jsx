import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  Cross, ShoppingCart, LogOut, Bell, LayoutDashboard, User as UserIcon 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications } = useContext(AuthContext);
  const { totalItemCount, setIsCartOpen } = useContext(CartContext);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'pharmacist') return '/pharmacist-dashboard';
    if (user.role === 'doctor') return '/doctor-dashboard';
    return '/user-dashboard';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. MediHeal Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-pharmacy-dark text-pharmacy-lime flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-pharmacy-deep transition">
              <Cross className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-pharmacy-dark tracking-tight">MediHeal</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider -mt-1 uppercase">Prescription Audit & Dispensing</span>
            </div>
          </Link>

          {/* 2. Public Navigation Links (Home, About Us, How It Works, Contact) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-600">
            <Link to="/" className={`hover:text-pharmacy-dark transition ${location.pathname === '/' ? 'text-pharmacy-dark font-bold' : ''}`}>
              Home
            </Link>
            <a href="#about" className="hover:text-pharmacy-dark transition">
              About Us
            </a>
            <a href="#workflow" className="hover:text-pharmacy-dark transition">
              How It Works
            </a>
            <a href="#contact" className="hover:text-pharmacy-dark transition">
              Contact
            </a>
          </nav>

          {/* 3. Authentication & Role Controls */}
          <div className="flex items-center gap-3">
            
            {user ? (
              /* Authenticated View */
              <div className="flex items-center gap-3">
                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-pharmacy-dark" />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pharmacy-lime text-pharmacy-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {totalItemCount}
                    </span>
                  )}
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotificationMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Notifications</span>
                        <span className="text-[10px] text-pharmacy-dark bg-pharmacy-lime/30 px-2 py-0.5 rounded-full font-semibold">
                          {notifications.length} Total
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} className="p-3 text-xs hover:bg-gray-50 transition">
                              <p className="font-semibold text-gray-800">{n.title}</p>
                              <p className="text-gray-500 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile / Dashboard Link */}
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-full transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-pharmacy-dark" />
                  <span className="max-w-[100px] truncate">{user.name || user.doctorId}</span>
                  <span className="text-[10px] uppercase font-bold bg-pharmacy-dark text-pharmacy-lime px-1.5 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Unauthenticated View */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold bg-pharmacy-dark text-white hover:bg-pharmacy-deep px-5 py-2.5 rounded-full shadow-xs transition"
                >
                  Login
                </Link>
                <Link
                  to="/other-logins"
                  className="text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2.5 rounded-full border border-gray-200 transition"
                >
                  Other Logins
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
