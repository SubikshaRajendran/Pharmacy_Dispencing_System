import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft, ShieldCheck } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto p-8 text-center text-xs text-gray-500">
          Loading order details...
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto p-8 text-center text-xs text-gray-500">
          <p className="text-sm font-bold text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/user-dashboard" className="text-pharmacy-dark underline font-bold">Return to Dashboard</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = ['Confirmed', 'Processing', 'Dispatched', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        <div className="flex items-center justify-between">
          <Link to="/user-dashboard" className="text-xs font-bold text-pharmacy-dark flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <StatusBadge status={order.orderStatus} />
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-8">
          
          {/* Header info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-xs font-bold text-gray-400 block uppercase">Order Reference</span>
              <h2 className="text-2xl font-extrabold text-gray-900 font-mono">#{order.orderId}</h2>
            </div>

            {order.trackingReference && (
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs">
                <span className="text-blue-900 font-bold block">Dispatch Tracking Code</span>
                <span className="font-mono text-blue-700 font-bold">{order.trackingReference}</span>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-6">Live Delivery Status Timeline</h3>
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                        isPassed
                          ? 'bg-pharmacy-dark text-pharmacy-lime'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-pharmacy-dark font-extrabold' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <h4 className="text-xs font-bold text-gray-800 mb-3">Purchased Medicine Items</h4>
              <div className="space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="font-semibold text-gray-800">{item.name} (x{item.quantity})</span>
                    <span className="font-mono">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-sm font-extrabold text-gray-900">
                  <span>Total Paid</span>
                  <span className="text-pharmacy-dark">${order.totalAmount.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-pharmacy-dark" /> Delivery Destination
              </h4>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">{order.deliveryAddress?.street}</p>
                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}</p>
                <p className="text-gray-400 font-mono">Contact: {order.deliveryAddress?.phone}</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
