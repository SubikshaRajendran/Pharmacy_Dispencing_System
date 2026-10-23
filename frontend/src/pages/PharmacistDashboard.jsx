import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { 
  Pill, Package, FileText, Truck, Plus, Search, 
  AlertTriangle, CheckCircle2, XCircle, Clock, ShieldCheck 
} from 'lucide-react';

const PharmacistDashboard = () => {
  const { user } = useContext(AuthContext);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'batches' | 'prescriptions' | 'orders'
  const [loading, setLoading] = useState(true);

  // Modal states for adding medicine & adding batch
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [selectedMedForBatch, setSelectedMedForBatch] = useState(null);

  // New Medicine form state
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState('Prescription Drugs');
  const [medUnit, setMedUnit] = useState('25 pieces');
  const [medPrice, setMedPrice] = useState(15.00);
  const [medDescription, setMedDescription] = useState('');
  const [isRxRequired, setIsRxRequired] = useState(true);

  // New Batch form state
  const [batchNumber, setBatchNumber] = useState('');
  const [batchQty, setBatchQty] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [costPrice, setCostPrice] = useState(8.00);
  const [sellingPrice, setSellingPrice] = useState(15.00);

  // Dispatch Tracking code state
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const fetchPharmacistData = async () => {
    try {
      setLoading(true);
      const [medRes, orderRes, prescRes] = await Promise.all([
        API.get('/medicines?activeOnly=false'),
        API.get('/orders/all'),
        API.get('/prescriptions/pending')
      ]);
      setMedicines(medRes.data);
      setOrders(orderRes.data);
      setPendingPrescriptions(prescRes.data);
    } catch (err) {
      console.error('Error loading pharmacist dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      await API.post('/medicines', {
        name: medName,
        category: medCategory,
        unit: medUnit,
        price: Number(medPrice),
        description: medDescription,
        isPrescriptionRequired: isRxRequired
      });
      setShowAddMedModal(false);
      fetchPharmacistData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create medicine');
    }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!selectedMedForBatch) return;

    try {
      await API.post(`/medicines/${selectedMedForBatch._id}/batches`, {
        batchNumber,
        quantityReceived: Number(batchQty),
        expiryDate,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice)
      });
      setShowAddBatchModal(false);
      fetchPharmacistData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add batch');
    }
  };

  const handleReviewPrescription = async (prescId, status, notes) => {
    try {
      await API.put(`/prescriptions/${prescId}/review`, {
        status,
        reviewNotes: notes
      });
      fetchPharmacistData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review prescription');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
        trackingReference: trackingCode || undefined
      });
      fetchPharmacistData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Banner */}
        <div className="bg-pharmacy-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold bg-pharmacy-lime text-pharmacy-dark px-3 py-1 rounded-full uppercase tracking-wider">
              Pharmacist Operations Console
            </span>
            <h1 className="text-2xl font-extrabold mt-1">Pharmacist Admin Dashboard</h1>
            <p className="text-xs text-gray-200">
              Logged in as: <strong>{user?.name} ({user?.email})</strong>
            </p>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="bg-pharmacy-lime text-pharmacy-dark font-bold text-xs px-5 py-3 rounded-full hover:bg-pharmacy-brightLime shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medicine Catalog ({medicines.length})</span>
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
            <span>Prescription Review Queue ({pendingPrescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-pharmacy-dark text-pharmacy-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Order Dispatch Center ({orders.length})</span>
          </button>
        </div>

        {/* Tab 1: Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">Current Medicine Stock Inventory</h3>
              <span className="text-xs text-gray-500">FEFO Stock Batch Strategy Enabled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Total Stock</th>
                    <th className="p-3">Selling Price</th>
                    <th className="p-3">Rx Req</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {medicines.map(med => (
                    <tr key={med._id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{med.name}</td>
                      <td className="p-3 text-gray-600">{med.category}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={med.totalStock < 20 ? 'text-red-600 font-extrabold' : 'text-emerald-700'}>
                          {med.totalStock} units
                        </span>
                      </td>
                      <td className="p-3 font-mono">${med.price.toFixed(2)}</td>
                      <td className="p-3">{med.isPrescriptionRequired ? 'Yes' : 'No'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => { setSelectedMedForBatch(med); setShowAddBatchModal(true); }}
                          className="bg-gray-100 text-pharmacy-dark hover:bg-pharmacy-dark hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          + Add Stock Batch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Prescription Review Queue */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {pendingPrescriptions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-xs text-gray-400">
                No pending prescriptions requiring manual review.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPrescriptions.map(presc => (
                  <div key={presc._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Patient: {presc.patientName || presc.userId?.name}</h4>
                        <span className="text-xs text-gray-400 font-mono">Doctor ID Match: {presc.doctorId || 'Unmatched'}</span>
                      </div>
                      <StatusBadge status={presc.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono">
                        <span className="font-bold text-gray-700 block mb-1">OCR Raw Text:</span>
                        <p className="text-gray-600 line-clamp-3 italic">{presc.extractedText}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                        <span className="font-bold text-purple-900 block mb-1">System Audit Flags:</span>
                        <ul className="list-disc pl-4 text-purple-800 space-y-0.5">
                          {presc.verificationFlags?.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReviewPrescription(presc._id, 'Rejected', 'Invalid Doctor ID or Unreadable prescription image')}
                        className="bg-red-50 text-red-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-red-100 transition"
                      >
                        Reject Prescription
                      </button>

                      <button
                        onClick={() => handleReviewPrescription(presc._id, 'Verified', 'Approved by Pharmacist Admin')}
                        className="bg-pharmacy-dark text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-pharmacy-deep shadow-sm transition"
                      >
                        Approve & Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Order Dispatch Center */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Patient Orders Requiring Action</h3>

            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                    <div>
                      <span className="font-mono font-bold text-pharmacy-dark">#{order.orderId}</span>
                      <span className="text-gray-500 ml-2 font-semibold">Patient: {order.userId?.name} ({order.deliveryAddress?.phone})</span>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-700">Items: </span>
                      <span className="text-gray-600">{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</span>
                    </div>
                    <span className="font-bold text-gray-900 font-mono">${order.totalAmount.toFixed(2)} USD</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Optional Dispatch Tracking Reference (e.g. TRK-99201)"
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none flex-1"
                    />

                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'Processing')}
                      className="bg-blue-600 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      Mark Processing
                    </button>

                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'Dispatched')}
                      className="bg-pharmacy-dark text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg hover:bg-pharmacy-deep"
                    >
                      Dispatch Order
                    </button>

                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                      className="bg-emerald-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg hover:bg-emerald-800"
                    >
                      Mark Delivered
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Add New Medicine to Catalog</h3>
            
            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="Prescription Drugs">Prescription Drugs</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Diabetic Care">Diabetic Care</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Devices">Devices</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="Hair Care">Hair Care</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={medPrice}
                    onChange={(e) => setMedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit Description</label>
                <input
                  type="text"
                  value={medUnit}
                  onChange={(e) => setMedUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rxReq"
                  checked={isRxRequired}
                  onChange={(e) => setIsRxRequired(e.target.checked)}
                />
                <label htmlFor="rxReq" className="font-semibold text-gray-700">Requires Prescription (Rx)</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-pharmacy-dark text-white font-bold py-2.5 rounded-xl hover:bg-pharmacy-deep"
                >
                  Create Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Batch Modal */}
      {showAddBatchModal && selectedMedForBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Add Stock Batch for {selectedMedForBatch.name}</h3>

            <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  placeholder="BATCH-9910"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity Received</label>
                  <input
                    type="number"
                    required
                    value={batchQty}
                    onChange={(e) => setBatchQty(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-pharmacy-dark text-white font-bold py-2.5 rounded-xl hover:bg-pharmacy-deep"
                >
                  Add Batch Stock
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

export default PharmacistDashboard;
