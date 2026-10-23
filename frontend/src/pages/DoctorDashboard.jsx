import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { Stethoscope, FileText, ShoppingBag, CheckCircle2, User, Search, ShieldCheck } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientOrders, setPatientOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prescriptions');

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [prescRes, orderRes] = await Promise.all([
        API.get('/prescriptions/doctor'),
        API.get('/orders/doctor')
      ]);
      setPrescriptions(prescRes.data);
      setPatientOrders(orderRes.data);
    } catch (err) {
      console.error('Error loading doctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Doctor Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
              <Stethoscope className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{user?.name || 'Authorized Practitioner'}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Practitioner
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{user?.qualification || 'Medical Practitioner'} {user?.specialization ? `• ${user.specialization}` : ''}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                <span className="bg-blue-50 text-blue-800 font-mono font-bold px-2 py-0.5 rounded">
                  Doctor ID: {user?.doctorId || 'N/A'}
                </span>
                <span>{user?.hospitalName || 'MediHeal Medical Center'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Dashboard Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'prescriptions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prescriptions Issued ({prescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Patient Dispensing Orders ({patientOrders.length})</span>
          </button>
        </div>

        {/* Tab 1: Doctor Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-xs text-gray-400">
                No active prescriptions associated with Doctor ID '{user?.doctorId}'.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptions.map(presc => (
                  <div key={presc._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-900">Patient: {presc.patientName || presc.userId?.name}</span>
                        <span className="text-[10px] text-gray-400 block">{new Date(presc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <StatusBadge status={presc.status} />
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-gray-700">Prescribed Medicine Items:</span>
                      {presc.medicines?.map((m, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600 text-[11px] bg-gray-50 p-2 rounded-lg">
                          <span>• {m.name} ({m.dosage})</span>
                          <span className="font-mono font-bold">Qty: {m.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Patient Dispensing Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {patientOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-xs text-gray-400">
                No dispensing orders linked to prescriptions issued under your Doctor ID.
              </div>
            ) : (
              <div className="space-y-4">
                {patientOrders.map(order => (
                  <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        #{order.orderId}
                      </span>
                      <p className="text-xs font-bold text-gray-800 mt-1">Patient: {order.userId?.name}</p>
                      <p className="text-[11px] text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="text-xs font-mono">
                      {order.items.map((it, idx) => (
                        <p key={idx} className="text-gray-700">• {it.name} (Qty: {it.quantity})</p>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.orderStatus} />
                      <span className="text-xs font-bold text-gray-900">${order.totalAmount.toFixed(2)} USD</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;
