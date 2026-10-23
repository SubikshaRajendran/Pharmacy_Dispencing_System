import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Heart, Plus, ShoppingCart, Lock } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const discountAmount = product.discountPrice > 0 ? (product.price - product.discountPrice).toFixed(0) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group relative">
      
      {/* Discount Badge */}
      {discountAmount > 0 && (
        <span className="absolute top-3 left-3 bg-pharmacy-lime text-pharmacy-dark text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10">
          Save ${discountAmount}
        </span>
      )}

      {/* Prescription Required Badge */}
      {product.isPrescriptionRequired && (
        <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
          <Lock className="w-3 h-3" /> Rx Required
        </span>
      )}

      {/* Image Container */}
      <div className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="max-h-full object-contain group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[32px] group-hover:text-pharmacy-dark transition">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-gray-900">
                ${(product.discountPrice > 0 ? product.discountPrice : product.price).toFixed(2)} USD
              </span>
              {product.discountPrice > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {product.unit || '25 pieces'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.totalStock <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-full transition shadow-xs ${
              product.totalStock > 0
                ? 'bg-pharmacy-dark text-white hover:bg-pharmacy-deep active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
          
          <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
