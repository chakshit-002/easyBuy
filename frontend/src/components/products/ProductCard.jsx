// import React from 'react'
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { Plus } from 'lucide-react';
// import {addToCartAsync} from '../../features/cart/cartSlice';

// const ProductCard = ({ product }) => {
//     const dispatch = useDispatch();

//     const handleAddToCart = (e) => {
//         e.preventDefault(); // Taaki card click hone par detail page na khule
//         dispatch(addToCartAsync({
//             productId: product._id,
//             qty: 1
//         }));
//     };
//     return (
//         <Link to={`/product/${product._id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 group">
//             <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
//                 <img
//                     src={product.images[0]?.url || 'https://via.placeholder.com/150'}
//                     alt={product.title}
//                     className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
//                 />
//                 {product.stock < 1 && (
//                     <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
//                 )}
//             </div>
//             <h3 className="font-bold text-gray-800 truncate">{product.title}</h3>
//             <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
//             <div className="mt-4 flex justify-between items-center">
//                 <span className="text-xl font-bold text-blue-600">
//                     {product.price.currency === 'INR' ? '₹' : '$'}{product.price.amount}
//                 </span>
//                 <button onClick={handleAddToCart} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
//                     🛒
//                 </button>
               
//             </div>
//         </Link>
//     );
// };

// export default ProductCard




import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import { addToCartAsync } from '../../features/cart/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const [isAdding, setIsAdding] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Click card par na jaye
        if (product.stock < 1) return toast.error("Out of stock!");

        setIsAdding(true);
        try {
            // Humne 'qty' bheja hai jaisa backend maang raha tha
            await dispatch(addToCartAsync({
                productId: product._id,
                qty: 1
            })).unwrap();

            // Success Animation
            setIsSuccess(true);
            toast.success(`${product.title} added to cart!`, {
                icon: '🛒',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });

            // 2 second baad wapas normal icon
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (error) {
            toast.error(error || "Failed to add item");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Link to={`/product/${product._id}`} className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 border border-gray-100 group flex flex-col h-full">
            <div className="relative h-52 mb-4 overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center">
                <img
                    src={product.images[0]?.url || 'https://via.placeholder.com/150'}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 p-4"
                />
                {product.stock < 1 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Sold Out</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{product.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 flex-1">{product.description}</p>
                
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Price</span>
                        <span className="text-lg font-black text-gray-900">
                            {product.price.currency === 'INR' ? '₹' : '$'}{product.price.amount.toLocaleString()}
                        </span>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock < 1}
                        className={`relative overflow-hidden p-3 rounded-xl transition-all active:scale-90 shadow-md ${
                            isSuccess ? 'bg-green-500 shadow-green-100' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
                        } ${isAdding ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                        {isAdding ? (
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                        ) : isSuccess ? (
                            <CheckCircle2 className="h-5 w-5 text-white animate-in zoom-in" />
                        ) : (
                            <ShoppingCart className="h-5 w-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;