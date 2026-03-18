import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productSlice';
import { addToCartAsync } from '../features/cart/cartSlice';
import {
  ShoppingCart, Zap, ShieldCheck, Truck,
  RotateCcw, Star, Plus, Minus, Heart, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux se data nikalna
  const { selectedProduct: product, loading } = useSelector(state => state.products);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Fetching product details...</p>
      </div>
    );
  }

  // 2. Error State (Agar product na mile)
  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl font-bold text-gray-400">Product not found!</p>
      </div>
    );
  }

  const handleAddToCart = async (shouldRedirect = false) => {
    try {
      await dispatch(addToCartAsync({
        productId: product._id,
        qty: parseInt(quantity)
      })).unwrap();

      if (shouldRedirect) {
        navigate('/checkout');
      } else {
        toast.success('Added to cart!', {
          style: { borderRadius: '15px', background: '#333', color: '#fff' }
        });
      }
    } catch (err) {
      toast.error(err || 'Failed to add item');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(true); // Isse item add bhi hoga aur redirect bhi
  };
  // Logic for Discount
  const originalPrice = (product.originalPrice || product.price?.amount) + 2000; // Fallback agar backend mein na ho
  const discount = Math.round(((originalPrice - product.price?.amount) / originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 bg-white min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* --- LEFT: IMAGE SECTION --- */}
        <div className="flex-1 space-y-4">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100 aspect-square flex items-center justify-center">
            <img
              src={product.images?.[selectedImage]?.url || product.image.url}
              alt={product.title}
              className="max-h-full object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Thumbnails (sirf tab dikhao agar multiple images hon) */}
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all overflow-hidden ${selectedImage === idx ? 'border-blue-600' : 'border-gray-100'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt="thumb" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT: PRODUCT INFO --- */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-100 pb-6">
            {/* <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">{product.category || 'Premium'}</span> */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 leading-tight">
              {product.title}
            </h1>

            {/* <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                                <Star className="h-4 w-4 text-green-600 fill-green-600" />
                                <span className="ml-1 text-green-700 font-bold">{product.rating || '4.5'}</span>
                            </div>
                            <span className="text-gray-400 text-sm font-medium">Verified Product</span>
                        </div> */}
          </div>

          {/* Price Section */}
          <div className="py-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-gray-900">₹{product.price?.amount.toLocaleString()}</span>
              <span className="text-xl text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                {discount}% OFF
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">Inclusive of all taxes</p>
          </div>

          {/* Action Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center border-2 border-gray-100 rounded-2xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-gray-50 rounded-xl"><Minus className="h-5 w-5" /></button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 hover:bg-gray-50 rounded-xl"><Plus className="h-5 w-5" /></button>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => handleAddToCart(false)} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95">
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                <Zap className="h-5 w-5" /> Buy Now
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-8 pt-8 border-t border-gray-100">
            {/* 1. Fast Delivery */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-tight">
                Fast Delivery
              </span>
            </div>

            {/* 2. 1 Year Warranty */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-tight">
                1 Year Warranty
              </span>
            </div>

            {/* 3. Secure Payments (New) */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5 6.17V7l-7-3-7 3v5.17c0 4.53 3 8.79 7 9.83 4-1.04 7-5.3 7-9.83z"
                  />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-tight">
                Secure Payments
              </span>
            </div>

            {/* 4. Premium Quality (New - Custom Choice) */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-tight">
                Premium Quality
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tab */}
      <div className="mt-16 bg-gray-50 rounded-[2.5rem] p-8 sm:p-12">
        <h2 className="text-2xl font-bold mb-6">Product Details</h2>
        <p className="text-gray-600 leading-relaxed max-w-4xl text-lg">
          {product.description || "No description available for this product."}
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;