

// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { fetchCart, updateCartQtyAsync, removeFromCartAsync } from '../features/cart/cartSlice';
// import toast from 'react-hot-toast';

// const Cart = () => {
//   const dispatch = useDispatch();
//   const { items, loading } = useSelector(state => state.cart);

//   useEffect(() => {
//     dispatch(fetchCart());
//   }, [dispatch]);

//   const handleQtyChange = async (pId, currentQty, delta) => {
//     // Agar pId undefined hai toh yahi rok do
//     if (!pId) {
//       toast.error("Product ID missing!");
//       return;
//     }
//     const newQty = currentQty + delta;
//     if (newQty > 0) {
//       try {
//         await dispatch(updateCartQtyAsync({ productId: pId, qty: newQty })).unwrap();
//       } catch (err) {
//         toast.error(err || "Update failed");
//       }
//     }
//   };

//   const subtotal = items.reduce((acc, item) => {
//     const price = item.productId?.price?.amount || 0;
//     return acc + (price * item.quantity);
//   }, 0);

//   const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 150;
//   const total = subtotal + shipping;

//   if (loading && items.length === 0) {
//     return (
//       <div className="min-h-[80vh] flex flex-col items-center justify-center">
//         <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
//         <p className="mt-4 text-gray-500 font-medium">Loading your bag...</p>
//       </div>
//     );
//   }

//   if (items.length === 0) {
//     return (
//       <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
//         <div className="bg-gray-100 p-8 rounded-full mb-6">
//           <ShoppingBag className="h-12 w-12 text-gray-400" />
//         </div>
//         <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
//         <p className="text-gray-500 mt-2 mb-8 max-w-sm">Looks like you haven't added anything yet. Start exploring our latest collection!</p>
//         <Link to="/" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95">
//           Start Shopping
//         </Link>
//       </div>
//     );
//   }

//   const handleRemoveItem = (pId) => {
//     if (window.confirm("Are you sure you want to remove this item?")) {
//       dispatch(removeFromCartAsync(pId));
//     }
//   };


//   console.log("Cart Items at cart page ", items);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16 min-h-screen bg-gray-50/30">
//       <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight">Shopping Bag</h1>

//       <div className="flex flex-col lg:flex-row gap-12">
//         {/* LEFT: ITEM LIST */}
//         <div className="flex-[1.5] space-y-6">
//           {items.map((item) => {
//             // Humne backend se productId ko hi object bana kar bheja hai
//             const product = item.productId;
//             const pId = product?._id; // Original Product ID

//             return (
//               <div key={item._id} className="flex items-center gap-4 p-4 border-b">
//                 {/* Image Handling */}
//                 <img
//                   src={product?.images?.[0]?.url || 'https://placehold.co/100'}
//                   alt={product?.title}
//                   className="w-20 h-20 object-cover rounded"
//                 />

//                 <div className="flex-1">
//                   <h3 className="font-bold text-lg">{product?.title || "Loading..."}</h3>
//                   <p className="text-blue-600 font-bold">₹{product?.price?.amount || 0}</p>

//                   {/* Quantity Controls */}
//                   <div className="flex items-center gap-2 mt-2">
//                     <button
//                       onClick={() => handleQtyChange(pId, item.quantity, -1)}
//                       className="p-1 bg-gray-200 rounded"
//                     >
//                       <Minus size={16} />
//                     </button>

//                     <span className="font-bold">{item.quantity}</span>

//                     <button
//                       onClick={() => handleQtyChange(pId, item.quantity, 1)}
//                       className="p-1 bg-gray-200 rounded"
//                     >
//                       <Plus size={16} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Remove Button */}
//                 <button onClick={() => handleRemoveItem(item.productId?._id || item.productId)}>
//                   <Trash2 className="text-red-500" />
//                 </button>
//               </div>
//             );
//           })}
//         </div>

//         {/* RIGHT: SUMMARY */}
//         <div className="flex-1">
//           <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-sm border border-gray-100 sticky top-10">
//             <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>

//             <div className="space-y-5 border-b border-gray-50 pb-8 text-gray-500 font-medium">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Shipping</span>
//                 <span className={shipping === 0 ? "text-green-500 font-bold" : "text-gray-900 font-bold"}>
//                   {shipping === 0 ? "FREE" : `₹${shipping}`}
//                 </span>
//               </div>
//             </div>

//             <div className="flex justify-between items-center py-8">
//               <span className="text-lg font-bold text-gray-900">Total</span>
//               <span className="text-3xl font-black text-blue-600 tracking-tight">₹{total.toLocaleString()}</span>
//             </div>

//             <button className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-100 transition-all active:scale-95 group">
//               Checkout <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
//             </button>

//             <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
//               <ShieldCheck className="h-4 w-4 text-green-500" /> Secure Payment
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;


import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCart, updateCartQtyAsync, removeFromCartAsync } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQtyChange = async (pId, currentQty, delta) => {
    if (!pId) {
      toast.error("Product ID missing!");
      return;
    }
    const newQty = currentQty + delta;
    if (newQty > 0) {
      try {
        await dispatch(updateCartQtyAsync({ productId: pId, qty: newQty })).unwrap();
      } catch (err) {
        toast.error(err || "Update failed");
      }
    }
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.productId?.price?.amount || 0;
    return acc + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shipping;

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500 font-bold tracking-widest uppercase text-xs">Syncing your bag...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-50 p-12 rounded-full mb-8">
          <ShoppingBag className="h-16 w-16 text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Your bag is empty</h2>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">Looks like you haven't added anything yet. Quality over quantity, but zero is too little!</p>
        <Link to="/" className="bg-gray-900 text-white px-10 py-5 rounded-full font-bold hover:bg-blue-600 transition-all shadow-xl active:scale-95">
          Explore Collection
        </Link>
      </div>
    );
  }

  const handleRemoveItem = (pId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      dispatch(removeFromCartAsync(pId));
    }
  };

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Container widened to 1440px for more horizontal space */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-16">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">MY BAG</h1>
                <p className="text-gray-400 font-medium mt-2">Check your items before checkout</p>
            </div>
            <Link to="/" className="text-sm font-bold text-blue-600 hover:underline underline-offset-4 tracking-tight uppercase">
                Back to Shopping
            </Link>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT: ITEM LIST (Occupies 2 parts of the grid) */}
          <div className="flex-[2] space-y-8">
            {items.map((item) => {
              const product = item.productId;
              const pId = product?._id; 

              return (
                <div key={item._id} className="group relative flex flex-col sm:flex-row items-center gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-100/50 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500">
                  
                  {/* Image Container */}
                  <div className="w-44 h-44 bg-gray-50 rounded-[2rem] overflow-hidden flex-shrink-0 relative">
                    <img
                      src={product?.images?.[0]?.url || 'https://placehold.co/400'}
                      alt={product?.title}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 w-full flex flex-col h-44 justify-between py-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-2xl text-gray-900 tracking-tight leading-tight">{product?.title || "Premium Product"}</h3>
                            <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">ID: {item._id.slice(-6)}</p>
                        </div>
                        <button 
                            onClick={() => handleRemoveItem(item.productId?._id || item.productId)}
                            className="text-gray-300 hover:text-red-500 p-2 transition-colors duration-300 cursor-pointer"
                        >
                            <Trash2 className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        {/* Improved Qty Controls */}
                        <div className="flex items-center gap-6 bg-gray-50 px-6 py-3 rounded-full border border-gray-100">
                            <button 
                                onClick={() => handleQtyChange(pId, item.quantity, -1)}
                                className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                            >
                                <Minus size={18} strokeWidth={3} />
                            </button>
                            <span className="font-black text-xl w-6 text-center">{item.quantity}</span>
                            <button 
                                onClick={() => handleQtyChange(pId, item.quantity, 1)}
                                className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                            >
                                <Plus size={18} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="text-right">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">
                                ₹{((product?.price?.amount || 0) * item.quantity).toLocaleString()}
                            </p>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SUMMARY CARD (Fixed width on desktop, flexible on mobile) */}
          <div className="flex-[0.8] lg:min-w-[420px]">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 sticky top-10 border border-gray-50">
              <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Order Summary</h2>

              <div className="space-y-6 mb-10 text-gray-500 font-bold">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Subtotal</span>
                  <span className="text-gray-900 font-black tracking-tight">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-black tracking-tight" : "text-gray-900 font-black tracking-tight"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">Add ₹{(1001 - subtotal).toLocaleString()} more for FREE shipping</p>
                )}
              </div>

              <div className="pt-8 border-t border-gray-50 flex justify-between items-end mb-12">
                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Final Pay</span>
                <span className="text-5xl font-black text-blue-600 tracking-tighter leading-none">₹{total.toLocaleString()}</span>
              </div>

              <button className="w-full cursor-pointer bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-gray-900 transition-all hover:shadow-2xl active:scale-[0.98] group">
                Checkout Now <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-4 w-4 text-green-500" /> 256-Bit SSL Secured
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Cart;