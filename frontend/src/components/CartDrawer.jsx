import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, attachedPrescription } = useContext(CartContext);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const deliveryFee = subtotal > 50 ? 0 : 5.00;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-pharmacy-dark text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pharmacy-lime" />
            <h2 className="text-base font-bold">Shopping Cart</h2>
            <span className="bg-pharmacy-lime text-pharmacy-dark text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-pharmacy-deep transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Badge if Attached */}
        {attachedPrescription && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Verified Rx attached: <strong>{attachedPrescription.doctorName}</strong></span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">Verified</span>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-16 h-16 stroke-1 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-600">Your cart is currently empty</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Explore our healthcare products or upload a prescription to get started.</p>
            </div>
          ) : (
            cartItems.map(item => {
              const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
              return (
                <div key={item._id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-gray-200"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">{item.unit || '25 pieces'}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-pharmacy-dark">
                        ${(itemPrice * item.quantity).toFixed(2)} USD
                      </span>

                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-pharmacy-dark">${grandTotal.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-pharmacy-dark text-white font-semibold py-3 px-4 rounded-xl hover:bg-pharmacy-deep flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-pharmacy-lime" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
