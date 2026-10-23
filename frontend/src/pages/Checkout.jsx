import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShoppingBag, MapPin, Phone, CreditCard, ShieldCheck, 
  CheckCircle2, ArrowRight, AlertCircle, Trash2 
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, subtotal, clearCart, attachedPrescription } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [street, setStreet] = useState(user?.deliveryAddress?.addressLine1 || '');
  const [city, setCity] = useState(user?.deliveryAddress?.city || '');
  const [state, setState] = useState(user?.deliveryAddress?.state || '');
  const [zipCode, setZipCode] = useState(user?.deliveryAddress?.postalCode || '');
  const [phone, setPhone] = useState(user?.deliveryAddress?.phoneNumber || user?.phone || '');

  React.useEffect(() => {
    if (user?.deliveryAddress?.addressLine1) {
      setStreet(user.deliveryAddress.addressLine1);
      setCity(user.deliveryAddress.city || '');
      setState(user.deliveryAddress.state || '');
      setZipCode(user.deliveryAddress.postalCode || '');
      setPhone(user.deliveryAddress.phoneNumber || user.phone || '');
    } else if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const deliveryCharge = subtotal > 50 ? 0 : 5.00;
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          medicineId: item._id,
          name: item.name,
          quantity: item.quantity
        })),
        prescriptionId: attachedPrescription?._id || null,
        deliveryAddress: { street, city, state, zipCode, phone }
      };

      const { data } = await API.post('/orders', orderPayload);
      setCompletedOrder(data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Order placement failed. Please check stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {completedOrder ? (
          /* Order Confirmation Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-2xl text-center max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center font-bold">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
              <p className="text-xs text-gray-500">
                Your order has been placed. We will notify you when your order is dispatched.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Reference:</span>
                <span className="font-bold text-pharmacy-dark">#{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-bold text-gray-900">${completedOrder.totalAmount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700">{completedOrder.orderStatus}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/orders/${completedOrder._id}`}
                className="w-full bg-pharmacy-dark text-white font-bold text-xs py-3 rounded-full hover:bg-pharmacy-deep shadow-md transition"
              >
                Track Order Status
              </Link>
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 font-semibold text-xs py-3 rounded-full hover:bg-gray-200 transition"
              >
                Back to Pharmacy Shop
              </Link>
            </div>
          </div>
        ) : (
          /* Checkout Form & Order Summary */
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-gray-900">Checkout & Delivery Address</h1>
              <p className="text-xs text-gray-500 mt-1">Confirm your items and doorstep delivery address</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Delivery Form */}
              <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pharmacy-dark" /> Step 1: Doorstep Delivery Address
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Zip Code</label>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pharmacy-dark"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-pharmacy-dark" /> Step 2: Payment Method
                  </h3>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
                    <span>Pay on Delivery / Verified Online Checkout</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full bg-pharmacy-dark text-white font-bold text-xs py-4 rounded-xl hover:bg-pharmacy-deep shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Processing Order...' : 'Confirm Order & Place Purchase'}
                </button>
              </form>

              {/* Right Column: Order Items Summary */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4 h-fit">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <ShoppingBag className="w-4 h-4 text-pharmacy-dark" /> Order Items Summary
                </h3>

                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto custom-scrollbar">
                  {cartItems.map(item => {
                    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                    return (
                      <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <span className="text-gray-400 text-[11px]">Qty: {item.quantity} x ${price.toFixed(2)}</span>
                        </div>
                        <span className="font-mono font-bold text-pharmacy-dark">${(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-gray-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryCharge === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${deliveryCharge.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Grand Total</span>
                    <span className="text-pharmacy-dark">${grandTotal.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
