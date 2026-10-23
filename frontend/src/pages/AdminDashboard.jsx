import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldCheck, Users, Stethoscope, Pill, Package, 
  Activity, Search, Plus, KeyRound, AlertTriangle 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'doctors' | 'pharmacists' | 'audit'
  const [loading, setLoading] = useState(true);

  // Modal states for creating doctor & pharmacist
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPharmacistModal, setShowAddPharmacistModal] = useState(false);

  // New Doctor form
  const [docIdInput, setDocIdInput] = useState('doc476');
  const [docName, setDocName] = useState('Dr. Marcus Vance');
  const [docRegNum, setDocRegNum] = useState('MED-REG-99201');
  const [docQualification, setDocQualification] = useState('MBBS, MD');
  const [docSpecialization, setDocSpecialization] = useState('General Medicine');
  const [docHospital, setDocHospital] = useState('MediHeal Central Hospital');

  // New Pharmacist form
  const [pharmName, setPharmName] = useState('');
  const [pharmEmail, setPharmEmail] = useState('');
  const [pharmPhone, setPharmPhone] = useState('');
  const [pharmPassword, setPharmPassword] = useState('Pharm@123');

  // Audit search filter
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, docsRes, logsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/doctors'),
        API.get('/admin/audit-logs')
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
      setDoctorsList(docsRes.data);
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/status`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/doctors', {
        doctorId: docIdInput,
        name: docName,
        registrationNumber: docRegNum,
        qualification: docQualification,
        specialization: docSpecialization,
        hospitalName: docHospital
      });
      setShowAddDoctorModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleCreatePharmacist = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/pharmacist', {
        name: pharmName,
        email: pharmEmail,
        phone: pharmPhone,
        password: pharmPassword
      });
      setShowAddPharmacistModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create pharmacist account');
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.changeSummary.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.actorName.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Banner */}
        <div className="bg-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold bg-purple-200 text-purple-900 px-3 py-1 rounded-full uppercase tracking-wider">
              System Administration
            </span>
            <h1 className="text-2xl font-extrabold mt-1">Admin Management Dashboard</h1>
            <p className="text-xs text-purple-200">
              System Administrator: <strong>{user?.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-white text-purple-900 font-bold text-xs px-4 py-2.5 rounded-full hover:bg-purple-100 shadow-md transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" /> Add Doctor
            </button>
            <button
              onClick={() => setShowAddPharmacistModal(true)}
              className="bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-full hover:bg-purple-800 border border-purple-500 shadow-md transition flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4" /> Add Pharmacist
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500'
            }`}
          >
            <Activity className="w-4 h-4" /> System Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500'
            }`}
          >
            <Users className="w-4 h-4" /> User Management ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'doctors' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor Management ({doctorsList.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> System Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: System Overview Metrics */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-400 font-medium">Registered Users</span>
                <p className="text-2xl font-extrabold text-gray-900">{stats.totalUsers}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-400 font-medium">Active Doctors</span>
                <p className="text-2xl font-extrabold text-blue-700">{stats.totalDoctors}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-400 font-medium">Total Medicines</span>
                <p className="text-2xl font-extrabold text-pharmacy-dark">{stats.totalMedicines}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-400 font-medium">Pending Reviews</span>
                <p className="text-2xl font-extrabold text-purple-700">{stats.pendingPrescriptions}</p>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {stats.lowStockMedicines?.length > 0 && (
              <div className="bg-red-50 rounded-3xl p-6 border border-red-100 space-y-3">
                <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Low Stock Inventory Alerts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stats.lowStockMedicines.map(med => (
                    <div key={med._id} className="bg-white p-3 rounded-xl border border-red-200 text-xs">
                      <p className="font-bold text-gray-900">{med.name}</p>
                      <p className="text-red-600 font-mono font-bold mt-0.5">Stock Remaining: {med.totalStock} units</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">User Accounts List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {usersList.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{u.name}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3 font-mono uppercase text-[10px]">{u.role}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          className="text-xs text-purple-700 hover:underline font-bold"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Doctor Management */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Verified Doctor Registry</h3>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-purple-800"
              >
                + Register Doctor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Doctor ID</th>
                    <th className="p-3">Doctor Name</th>
                    <th className="p-3">Qualification</th>
                    <th className="p-3">Reg Number</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {doctorsList.map(doc => (
                    <tr key={doc._id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold text-blue-700">{doc.doctorId}</td>
                      <td className="p-3 font-bold text-gray-900">{doc.name}</td>
                      <td className="p-3 text-gray-600">{doc.qualification}</td>
                      <td className="p-3 font-mono">{doc.registrationNumber}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {doc.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Searchable Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-gray-900">System Activity & Dispensing Audit Trail</h3>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor / Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Change Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium font-mono text-[11px]">
                  {filteredLogs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold text-purple-900">{log.actorName} ({log.actorRole})</td>
                      <td className="p-3 font-bold text-gray-800">{log.action}</td>
                      <td className="p-3 text-gray-600">{log.changeSummary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Register New Doctor Account</h3>

            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Doctor ID (Format: docXXX)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. doc476"
                  value={docIdInput}
                  onChange={(e) => setDocIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Medical Reg Number</label>
                <input
                  type="text"
                  required
                  value={docRegNum}
                  onChange={(e) => setDocRegNum(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-purple-700 text-white font-bold py-2.5 rounded-xl hover:bg-purple-800"
                >
                  Create Verified Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pharmacist Modal */}
      {showAddPharmacistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Create Pharmacist Account</h3>

            <form onSubmit={handleCreatePharmacist} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Marcus Brody"
                  value={pharmName}
                  onChange={(e) => setPharmName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="pharmacy2@mediheal.com"
                  value={pharmEmail}
                  onChange={(e) => setPharmEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={pharmPassword}
                  onChange={(e) => setPharmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPharmacistModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-purple-700 text-white font-bold py-2.5 rounded-xl hover:bg-purple-800"
                >
                  Create Pharmacist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
