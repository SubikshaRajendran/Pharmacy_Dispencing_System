import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import CartDrawer from '../components/CartDrawer';
import { 
  Upload, FileText, Package, MapPin, User, ChevronRight, 
  Sparkles, CheckCircle2, Clock, HelpCircle, Bell, Plus, ShieldCheck,
  Edit3, Phone, AlertCircle, X, Check
} from 'lucide-react';

const UserDashboard = () => {
  const { user, updateDeliveryAddress, updateProfile } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'prescriptions' | 'orders' | 'profile' | 'support'
  const [loading, setLoading] = useState(true);

  // Address editing state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);

  // Profile (name/phone) editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const openAddAddressModal = () => {
    setAddressForm({
      fullName: user?.name || '',
      phoneNumber: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States'
    });
    setAddressError('');
    setAddressSuccess('');
    setShowAddressModal(true);
  };

  const openEditAddressModal = () => {
    setAddressForm({
      fullName: user?.deliveryAddress?.fullName || user?.name || '',
      phoneNumber: user?.deliveryAddress?.phoneNumber || user?.phone || '',
      addressLine1: user?.deliveryAddress?.addressLine1 || '',
      addressLine2: user?.deliveryAddress?.addressLine2 || '',
      city: user?.deliveryAddress?.city || '',
      state: user?.deliveryAddress?.state || '',
      postalCode: user?.deliveryAddress?.postalCode || '',
      country: user?.deliveryAddress?.country || 'United States'
    });
    setAddressError('');
    setAddressSuccess('');
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');

    if (!addressForm.fullName.trim()) {
      setAddressError('Full Name is required.');
      return;
    }
    if (!addressForm.phoneNumber.trim()) {
      setAddressError('Phone Number is required.');
      return;
    }
    const digitsOnly = addressForm.phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setAddressError('Please enter a valid phone number with at least 7 digits.');
      return;
    }
    if (!addressForm.addressLine1.trim()) {
      setAddressError('Address Line 1 is required.');
      return;
    }
    if (!addressForm.city.trim()) {
      setAddressError('City is required.');
      return;
    }
    if (!addressForm.state.trim()) {
      setAddressError('State is required.');
      return;
    }
    const postal = addressForm.postalCode.trim();
    if (postal.length < 3 || postal.length > 12) {
      setAddressError('Please enter a valid postal / ZIP code (3-12 characters).');
      return;
    }
    if (!addressForm.country.trim()) {
      setAddressError('Country is required.');
      return;
    }

    setAddressSaving(true);
    try {
      await updateDeliveryAddress(addressForm);
      setAddressSuccess('Delivery address saved successfully!');
      setTimeout(() => {
        setShowAddressModal(false);
      }, 700);
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const openEditProfileModal = () => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setProfileError('');
    setProfileSuccess('');
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.name.trim()) {
      setProfileError('Full Name is required.');
      return;
    }
    if (!profileForm.phone.trim()) {
      setProfileError('Phone Number is required.');
      return;
    }
    const digitsOnly = profileForm.phone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setProfileError('Please enter a valid phone number with at least 7 digits.');
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowProfileModal(false);
      }, 700);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, prescRes] = await Promise.all([
        API.get('/orders/my'),
        API.get('/prescriptions/my')
      ]);
      setOrders(ordersRes.data);
      setPrescriptions(prescRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Personalized Welcome Banner */}
        <div className="bg-pharmacy-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="space-y-1.5 z-10 max-w-xl">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-pharmacy-lime text-pharmacy-dark px-3 py-0.5 rounded-full uppercase tracking-wider">
              Patient Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Valued Patient'}! 👋
            </h1>
            <p className="text-xs text-gray-200 leading-relaxed">
              Upload your printed prescription, track doctor verification status, and view doorstep delivery orders.
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-6 custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prescription Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'prescriptions'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Prescriptions ({prescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Delivery Address</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'support'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </button>
        </div>

        {/* Tab 1: Prescription Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Main Highlighted Prescription Upload Action Card */}
            <div className="bg-white rounded-3xl p-8 border-2 border-pharmacy-dark/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-pharmacy-dark text-pharmacy-lime rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                  <FileText className="w-9 h-9" />
                </div>
                <div className="space-y-1.5 max-w-xl">
                  <h2 className="text-xl font-extrabold text-gray-900">Upload Your Printed Prescription</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Upload a clear image or PDF of your printed prescription. Our system will extract the medicine details and validate the registered doctor information.
                  </p>
                </div>
              </div>

              <Link
                to="/upload-prescription"
                className="bg-pharmacy-dark text-white font-bold text-xs px-8 py-3.5 rounded-full hover:bg-pharmacy-deep shadow-md transition flex items-center gap-2 shrink-0"
              >
                <Upload className="w-4 h-4 text-pharmacy-lime" />
                <span>Upload Prescription</span>
              </Link>
            </div>

            {/* Compact Prescription Status Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Recent Prescription Statuses</h3>
                <button onClick={() => setActiveTab('prescriptions')} className="text-xs font-bold text-pharmacy-dark hover:underline">
                  View All ({prescriptions.length})
                </button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-xs text-gray-400">
                  No prescriptions uploaded yet. Click "Upload Prescription" above to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.slice(0, 2).map(presc => (
                    <div key={presc._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">Dr. {presc.doctorName || 'Identified Doctor'}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">Doctor ID: {presc.doctorId || 'Pending'}</span>
                        </div>
                        <StatusBadge status={presc.status} />
                      </div>

                      <div className="text-xs space-y-1 text-gray-600">
                        <span className="font-semibold block">Prescribed Medicines ({presc.medicines?.length || 0}):</span>
                        {presc.medicines?.map((m, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] bg-gray-50 p-1.5 rounded">
                            <span>• {m.name} ({m.dosage})</span>
                            <span className="font-mono">Qty: {m.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {presc.status === 'Verified' && (
                        <Link
                          to="/upload-prescription"
                          className="w-full mt-2 bg-pharmacy-dark text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-pharmacy-deep transition"
                        >
                          Proceed to Buy Prescribed Items
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compact Order History Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Recent Pharmacy Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-pharmacy-dark hover:underline">
                  View All Orders ({orders.length})
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-xs text-gray-400">
                  No pharmacy orders placed yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 2).map(order => (
                    <div key={order._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-pharmacy-dark bg-pharmacy-lime/30 px-2 py-0.5 rounded">
                          #{order.orderId}
                        </span>
                        <span className="text-gray-400 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.orderStatus} />
                        <span className="font-bold text-gray-900">${order.totalAmount.toFixed(2)} USD</span>
                        <Link to={`/orders/${order._id}`} className="text-pharmacy-dark font-bold hover:underline">
                          Track
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Uploaded Prescriptions & Verification</h3>
              <Link
                to="/upload-prescription"
                className="bg-pharmacy-dark text-white font-semibold text-xs px-4 py-2 rounded-full hover:bg-pharmacy-deep flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Upload New
              </Link>
            </div>

            {prescriptions.map(presc => (
              <div key={presc._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Dr. {presc.doctorName || 'Doctor Review'}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">Doctor ID: {presc.doctorId || 'Pending'}</span>
                  </div>
                  <StatusBadge status={presc.status} />
                </div>

                <div className="text-xs space-y-1">
                  {presc.medicines?.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600 text-[11px] bg-gray-50 p-2 rounded-lg">
                      <span>• {m.name} ({m.dosage})</span>
                      <span className="font-mono">Qty: {m.quantity}</span>
                    </div>
                  ))}
                </div>

                {presc.status === 'Verified' && (
                  <Link
                    to="/upload-prescription"
                    className="w-full mt-2 bg-pharmacy-dark text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-pharmacy-deep transition"
                  >
                    Proceed to Buy Prescribed Items
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">My Orders & Dispensing Status</h3>
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="font-mono font-bold text-pharmacy-dark">#{order.orderId}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div className="flex justify-between">
                  <span>Items: {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</span>
                  <span className="font-bold">${order.totalAmount.toFixed(2)} USD</span>
                </div>
                <Link to={`/orders/${order._id}`} className="text-pharmacy-dark font-bold hover:underline block text-right">
                  Track Delivery Timeline
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Profile & Address */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Saved Patient Profile & Address</h3>
              <button
                onClick={openEditProfileModal}
                className="text-xs font-bold text-pharmacy-dark hover:text-pharmacy-deep flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 block font-medium">Full Name</label>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{user?.name || 'Valued Patient'}</p>
              </div>
              <div>
                <label className="text-gray-400 block font-medium">Email Address</label>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{user?.email || 'N/A'}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-gray-400 block font-medium">Registered Phone Number</label>
                <p className="font-bold text-gray-800 text-sm mt-0.5 font-mono">
                  {user?.phone || 'No phone number registered'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pharmacy-dark" /> Doorstep Delivery Address
                </h4>
                {user?.deliveryAddress?.addressLine1 && (
                  <button
                    onClick={openEditAddressModal}
                    className="text-xs font-bold text-pharmacy-dark hover:text-pharmacy-deep flex items-center gap-1 bg-pharmacy-lime/30 px-3 py-1 rounded-full transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Address
                  </button>
                )}
              </div>

              {user?.deliveryAddress?.addressLine1 ? (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user.deliveryAddress.fullName || user.name}</p>
                      <p className="text-gray-600 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {user.deliveryAddress.phoneNumber || user.phone}
                      </p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Primary Delivery Address
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 text-gray-600 space-y-0.5">
                    <p className="font-medium text-gray-800">{user.deliveryAddress.addressLine1}</p>
                    {user.deliveryAddress.addressLine2 && <p>{user.deliveryAddress.addressLine2}</p>}
                    <p>{user.deliveryAddress.city}, {user.deliveryAddress.state} {user.deliveryAddress.postalCode}</p>
                    <p className="text-gray-500 font-medium">{user.deliveryAddress.country}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">No delivery address added yet.</p>
                  <button
                    onClick={openAddAddressModal}
                    className="bg-pharmacy-dark text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-pharmacy-deep transition shadow-xs"
                  >
                    Add Delivery Address
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Help & Support */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs max-w-xl mx-auto text-center space-y-4">
            <HelpCircle className="w-12 h-12 text-pharmacy-dark mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">Patient Support & Verification Assistance</h3>
            <p className="text-xs text-gray-500">
              If your prescription is flagged as "Needs Review", our registered pharmacist team will verify the document within 1-2 hours.
            </p>
            <p className="text-xs font-bold text-pharmacy-dark">Support Email: support@mediheal.com</p>
          </div>
        )}

        {/* Address Modal (Add / Edit) */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-pharmacy-lime/40 text-pharmacy-dark flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {user?.deliveryAddress?.addressLine1 ? 'Edit Delivery Address' : 'Add Delivery Address'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addressError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              {addressSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{addressSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555-0199"
                      value={addressForm.phoneNumber}
                      onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street address or P.O. Box"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Portland"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">State / Province *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OR"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-bold text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 97201"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United States"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="px-5 py-2 bg-pharmacy-dark text-white rounded-xl font-bold hover:bg-pharmacy-deep transition shadow-xs disabled:opacity-50"
                  >
                    {addressSaving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Modal (Edit Name & Phone) */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-pharmacy-lime/40 text-pharmacy-dark flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Edit Profile Information</h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Registered Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Must contain at least 7 digits (e.g. +1 555-019-2834)
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2 bg-pharmacy-dark text-white rounded-xl font-bold hover:bg-pharmacy-deep transition shadow-xs disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
