import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productSlice';
import { addToCartAsync } from '../features/cart/cartSlice';
import {
  ShoppingCart, Zap, ShieldCheck, Truck,
  Star, Plus, Minus, Loader2, ChevronLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedProduct: product, loading } = useSelector(state => state.products);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-bold tracking-tighter uppercase italic">Loading Premium Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-xl font-black text-gray-300 uppercase italic tracking-widest">Product not found!</p>
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

  const originalPrice = (product.originalPrice || product.price?.amount) + 2000;
  const discount = Math.round(((originalPrice - product.price?.amount) / originalPrice) * 100);

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    } else {
      toast.error(`Only ${product.stock} units available`, { id: 'stock-limit' });
    }
  };

  // 2. Buttons ka logic
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">

        {/* Back Button */}
        <Link to='/products' className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 mb-8 uppercase tracking-[0.2em] transition-all group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* --- LEFT: IMAGE SECTION (Fixed Height & Consistency) --- */}
          <div className="flex-1">
            <div className="sticky top-24 space-y-6 flex flex-col items-center justify-center overflow-hidden ">
              <div className="relative overflow-hidden rounded-[3rem] bg-[#F8F9FA] border border-gray-100 aspect-square flex items-center justify-center max-w-[440px]:h-[250px] min-w-[440px]:min-h-[200px] md:max-h-[550px] shadow-sm">
                <img
                  src={product.images?.[selectedImage]?.url || product.image.url}
                  alt={product.title}
                  className="w-full h-full object-contain p-8 transition-transform duration-700 hover:scale-110"
                />
                {discount > 0 && (
                  <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black italic tracking-widest">
                    {discount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="w-full overflow-x-auto ">
                {product.images?.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar sm:justify-center">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-[1.25rem] border-2 transition-all overflow-hidden p-1 bg-gray-50 ${selectedImage === idx ? 'border-blue-600 scale-105 shadow-lg shadow-blue-100' : 'border-transparent opacity-60'}`}
                      >
                        <img src={img.url} className="w-full h-full object-contain rounded-xl" alt="thumb" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT: PRODUCT INFO --- */}
          <div className="flex-1 flex flex-col pt-4">
            <div className="space-y-2 mb-6">
              <span className="text-blue-600 font-black text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase">Verified Seller Product</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tighter italic">
                {product.title}
              </h1>
            </div>

            {/* Price Card */}
            <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-8 border border-gray-100">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-3xl  sm:text-5xl font-black text-gray-900 tracking-tighter">₹{product.price?.amount.toLocaleString()}</span>
                <span className="text-[16px] sm:text-xl text-gray-400 line-through font-bold">₹{originalPrice.toLocaleString()}</span>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">MRP Incl. of all taxes • Free Shipping</p>
            </div>

            {/* Selection & Actions */}
            <div className="space-y-8">
              <div className="flex flex-col min-[450px]:flex-row min-[450px]:items-center gap-8">
                {/* Quantity Selector: Disable if Out of Stock */}
                <div className={`flex justify-around items-center bg-white border-2 border-gray-100 rounded-2xl p-1 shadow-sm ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-14 text-center font-black text-xl">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    onClick={handleIncrease} // 👈 Updated function
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</p>
                  <p className={`font-bold italic ${!isOutOfStock ? 'text-green-600' : 'text-red-500 underline decoration-wavy'}`}>
                    {!isOutOfStock ? `${product.stock} Units Left In Stock` : 'Currently Out of Stock'}
                  </p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Add to Cart Button */}
                <button
                  onClick={() => !isOutOfStock && handleAddToCart(false)}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black uppercase tracking-widest italic transition-all shadow-xl active:scale-95
          ${isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-2 border-dashed border-gray-200'
                      : 'bg-gray-900 text-white hover:bg-black'
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" /> {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={() => !isOutOfStock && handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black uppercase tracking-widest italic transition-all shadow-xl active:scale-95
          ${isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                    }`}
                >
                  <Zap className={`h-5 w-5 ${!isOutOfStock ? 'fill-white' : ''}`} /> {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
            </div>

            {/* Features (Refined) */}
            <div className="grid grid-cols-2 gap-6 mt-12 py-8 border-y border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl"><Truck className="h-6 w-6 text-blue-600" /></div>
                <span className="text-[10px] font-black text-gray-600 uppercase leading-tight">Fastest<br />Delivery</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl"><ShieldCheck className="h-6 w-6 text-blue-600" /></div>
                <span className="text-[10px] font-black text-gray-600 uppercase leading-tight">1 Year<br />Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section (Attractive) */}
        <div className="mt-20">
          <div className="inline-block bg-gray-900 text-white px-8 py-3 rounded-t-[2rem] font-black uppercase tracking-widest italic text-sm">
            Product Narrative
          </div>
          <div className="bg-gray-50 rounded-b-[3rem] rounded-tr-[3rem] p-8 sm:p-16 border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter mb-8 text-gray-900 uppercase">What makes it special?</h2>
            <p className="text-gray-600 leading-relaxed max-w-5xl text-md md:text-lg font-medium">
              {product.description || "Every detail of this product has been crafted for excellence. Experience premium quality that stands out in every aspect."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;