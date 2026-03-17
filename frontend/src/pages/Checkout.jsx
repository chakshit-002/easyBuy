// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { MapPin, Plus, CheckCircle2, Trash2, ArrowRight, Home, CreditCard, X } from 'lucide-react';
// import { fetchAddressesAsync, deleteAddressAsync, setSelectedAddress, addAddressAsync } from '../features/address/addressSlice';
// import { createOrderAsync } from '../features/order/orderSlice';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import { paymentAPI } from '../api/axios';
// import { fetchCart } from '../features/cart/cartSlice';

// const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };

// const Checkout = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { addresses, selectedAddress, loading, error } = useSelector(state => state.address);
//   const { items } = useSelector(state => state.cart);

//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [newAddress, setNewAddress] = useState({
//     street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false
//   });

//   useEffect(() => {
//     loadRazorpayScript();
//     dispatch(fetchAddressesAsync());
//     dispatch(fetchCart());
//   }, [dispatch]);

//   const subtotal = items.reduce((acc, item) => acc + (item.productId?.price?.amount || 0) * item.quantity, 0);
//   const shipping = subtotal > 1000 ? 0 : 150;
//   const total = subtotal + shipping;

//   const handleAddAddress = async (e) => {
//     e.preventDefault();
//     try {
//       await dispatch(addAddressAsync(newAddress)).unwrap();
//       setShowAddressForm(false);
//       setNewAddress({ street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
//     } catch (err) {
//       toast.error(typeof err === 'string' ? err : "Failed to add address");
//     }
//   };

//   const handlePayment = async (orderId) => {
//     const toastId = toast.loading("Initiating Payment..."); // Store toast ID to dismiss later
//     try {
//       const res = await paymentAPI.post(`/create/${orderId}`, {}, { withCredentials: true });
//       const { payment } = res.data;
//       toast.dismiss(toastId); // Remove loading toast once order is created

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: payment.price.amount,
//         currency: payment.price.currency,
//         name: "Gemini Store",
//         description: "Premium Purchase",
//         order_id: payment.razorpayOrderId,
//         handler: async (response) => {
//           const verifyingId = toast.loading("Verifying Payment...");
//           try {
//             const verifyRes = await axios.post(`http://localhost:3004/api/payments/verify`, {
//               razorpayOrderId: response.razorpay_order_id,
//               paymentId: response.razorpay_payment_id,
//               signature: response.razorpay_signature
//             }, { withCredentials: true });

//             toast.dismiss(verifyingId);
//             if (verifyRes.status === 200) {
//               toast.success("Payment Successful!");
//               navigate('/order');
//             }
//           } catch (err) {
//             toast.dismiss(verifyingId);
//             toast.error("Payment Verification Failed");
//           }
//         },
//         modal: {
//             ondismiss: function(){
//                 toast.dismiss(toastId); // Handle case where user closes popup
//             }
//         },
//         prefill: { name: "User", email: "user@example.com" },
//         theme: { color: "#2563eb" }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       toast.dismiss(toastId);
//       toast.error("Payment Initiation Failed");
//     }
//   };

//   const handleProceedToPayment = async () => {
//     if (!selectedAddress) return toast.error("Please select a delivery address first!");

//     const orderData = {
//       items: items.map(item => ({
//         product: item.productId._id || item.productId,
//         quantity: item.quantity,
//         price: {
//           amount: item.productId.price.amount * 100, 
//           currency: 'INR'
//         }
//       })),
//       totalPrice: { amount: total * 100, currency: 'INR' }, 
//       shippingAddress: selectedAddress
//     };

//     try {
//       const order = await dispatch(createOrderAsync(orderData)).unwrap();
//       handlePayment(order._id);
//     } catch (err) {
//       toast.error(typeof err === 'string' ? err : "Order failed");
//     }
//   }

//   return (
//     <div className="bg-[#f8fafc] min-h-screen pb-20">
//       <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">

//         {/* Progress Header - Fixed width for better look */}
//         <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-6 mb-10 overflow-x-auto pb-2 no-scrollbar border-b border-gray-100">
//           <div className="flex items-center gap-2 text-blue-600 shrink-0 pb-4 border-b-2 border-blue-600">
//             <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm">1</span>
//             <span className="font-bold text-xs sm:text-sm tracking-tight uppercase">Address</span>
//           </div>
//           <div className="h-[1px] w-8 sm:w-16 bg-gray-200 -mt-4"></div>
//           <div className="flex items-center gap-2 text-gray-400 shrink-0 pb-4">
//             <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs sm:text-sm">2</span>
//             <span className="font-bold text-xs sm:text-sm tracking-tight uppercase">Payment</span>
//           </div>
//         </div>

//         <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">

//           {/* LEFT: ADDRESS SELECTION */}
//           <div className="w-full xl:flex-[1.8] space-y-6">
//             <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//               <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
//                 <MapPin className="text-blue-600" /> Delivery Address
//               </h2>
//               <button
//                 onClick={() => setShowAddressForm(!showAddressForm)}
//                 className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full transition-all ${showAddressForm ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-100'}`}
//               >
//                 {showAddressForm ? <X size={16} /> : <Plus size={16} />} 
//                 <span className="hidden sm:inline">{showAddressForm ? 'Cancel' : 'Add New'}</span>
//               </button>
//             </div>

//             {showAddressForm && (
//               <form onSubmit={handleAddAddress} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-blue-50 animate-in fade-in slide-in-from-top-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <div className="md:col-span-2">
//                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street / House No.</label>
//                     <input required className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="123, Luxury Apartments" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
//                     <input required className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="New Delhi" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
//                     <input required className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Delhi" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
//                     <input required className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="India" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
//                     <input required className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="110001" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
//                   </div>
//                   <div className="md:col-span-2 flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl mt-2 border border-blue-100">
//                     <input type="checkbox" id="isDefault" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
//                     <label htmlFor="isDefault" className="text-xs font-bold text-gray-700 cursor-pointer uppercase tracking-tight">Set as default delivery address</label>
//                   </div>
//                 </div>
//                 <button type="submit" className="w-full md:w-auto mt-8 bg-gray-900 text-white px-12 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">Save Address</button>
//               </form>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//               {addresses.map((addr) => (
//                 <div
//                   key={addr._id}
//                   onClick={() => dispatch(setSelectedAddress(addr))}
//                   className={`relative p-6 sm:p-8 rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[180px] ${selectedAddress?._id === addr._id ? 'border-blue-600 bg-white shadow-xl shadow-blue-50' : 'border-white bg-white hover:border-blue-100 hover:shadow-lg'}`}
//                 >
//                   {selectedAddress?._id === addr._id && (
//                     <div className="absolute top-6 right-6 text-blue-600 animate-in zoom-in">
//                       <CheckCircle2 fill="currentColor" className="text-white bg-blue-600 rounded-full" size={24} />
//                     </div>
//                   )}
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                         <div className={`p-2.5 rounded-xl ${selectedAddress?._id === addr._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
//                         <Home size={18} />
//                         </div>
//                         <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">Home</span>
//                     </div>
//                     <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{addr.street}</p>
//                     <p className="text-gray-500 text-sm font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
//                   </div>

//                   <button
//                     onClick={(e) => { e.stopPropagation(); dispatch(deleteAddressAsync(addr._id)); }}
//                     className="mt-6 flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-tighter"
//                   >
//                     <Trash2 size={16} /> Remove
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT: ORDER SUMMARY - Adjusted for 1024px-1240px range */}
//           <div className="w-full xl:flex-1 lg:max-w-[450px] mx-auto xl:mx-0">
//             <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 sticky top-10">
//               <h2 className="text-xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4 flex items-center gap-2">
//                 Order Summary
//               </h2>

//               <div className="space-y-4 mb-8 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
//                 {items.map(item => (
//                   <div key={item._id} className="flex justify-between items-start gap-4">
//                     <div className="flex-1">
//                       <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.productId?.title}</p>
//                       <p className="text-[10px] text-gray-400 font-bold uppercase">Qty: {item.quantity}</p>
//                     </div>
//                     <span className="text-sm font-black text-gray-900 whitespace-nowrap">₹{((item.productId?.price?.amount || 0) * item.quantity).toLocaleString()}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="space-y-4 pt-6 border-t border-gray-50 mb-8">
//                 <div className="flex justify-between text-gray-500 font-bold text-sm">
//                   <span>Subtotal</span>
//                   <span className="text-gray-900 font-black">₹{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-500 font-bold text-sm">
//                   <span>Shipping Cost</span>
//                   <span className={shipping === 0 ? "text-green-500 font-black" : "text-gray-900 font-black"}>
//                     {shipping === 0 ? "FREE" : `₹${shipping}`}
//                   </span>
//                 </div>
//                 <div className="flex justify-between pt-4 border-t border-gray-50">
//                   <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
//                   <span className="text-3xl font-black text-blue-600 tracking-tighter italic">₹{total.toLocaleString()}</span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleProceedToPayment}
//                 disabled={!selectedAddress}
//                 className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${selectedAddress ? 'bg-blue-600 text-white hover:bg-gray-900 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'}`}
//               >
//                 Proceed to Payment <ArrowRight className="group-hover:translate-x-1 transition-transform" />
//               </button>

//               <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-50 pt-6">
//                 <div className="flex items-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">
//                     <CreditCard size={14} /> Secure Checkout
//                 </div>
//                 <div className="flex gap-4 opacity-30 grayscale">
//                     <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="paypal" />
//                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="visa" />
//                     <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="mastercard" />
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Plus, CheckCircle2, Trash2, ArrowRight, Home, CreditCard, X } from 'lucide-react';
import { fetchAddressesAsync, deleteAddressAsync, setSelectedAddress, addAddressAsync } from '../features/address/addressSlice';
import { createOrderAsync } from '../features/order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios'; 
import { paymentAPI } from '../api/axios';
import { fetchCart } from '../features/cart/cartSlice';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addresses, selectedAddress, loading, error } = useSelector(state => state.address);
  const { items } = useSelector(state => state.cart);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false
  });

  useEffect(() => {
    loadRazorpayScript();
    dispatch(fetchAddressesAsync());
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = items.reduce((acc, item) => acc + (item.productId?.price?.amount || 0) * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addAddressAsync(newAddress)).unwrap();
      setShowAddressForm(false);
      setNewAddress({ street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Failed to add address");
    }
  };

  const handlePayment = async (orderId) => {
    const loadingToast = toast.loading("Connecting to Secure Gateway...");
    try {
      const res = await paymentAPI.post(`/create/${orderId}`, {}, { withCredentials: true });
      const { payment } = res.data;
      toast.dismiss(loadingToast);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: payment.price.amount,
        currency: payment.price.currency,
        name: "Gemini Store",
        description: "Premium Purchase",
        order_id: payment.razorpayOrderId,
        handler: async (response) => {
          const verifyToast = toast.loading("Verifying Transaction...");
          try {
            const verifyRes = await axios.post(`http://localhost:3004/api/payments/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            }, { withCredentials: true });

            toast.dismiss(verifyToast);
            if (verifyRes.status === 200) {
              toast.success("Payment Successful!");
              navigate('/orders');
            }
          } catch (err) {
            toast.dismiss(verifyToast);
            toast.error("Payment Verification Failed");
          }
        },
        modal: {
          ondismiss: function() {
            toast.dismiss(loadingToast);
            toast.error("Payment Cancelled");
          }
        },
        prefill: { name: "User", email: "user@example.com" },
        theme: { color: "#2563eb" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Payment Initiation Failed");
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) return toast.error("Please select a delivery address first!");

    const orderData = {
      items: items.map(item => ({
        product: item.productId._id || item.productId,
        quantity: item.quantity,
        price: {
          amount: item.productId.price.amount * 100,
          currency: 'INR'
        }
      })),
      totalPrice: { amount: total * 100, currency: 'INR' },
      shippingAddress: selectedAddress
    };

    const orderToast = toast.loading("Creating Order...");
    try {
      const order = await dispatch(createOrderAsync(orderData)).unwrap();
      toast.dismiss(orderToast);
      handlePayment(order._id);
    } catch (err) {
      toast.dismiss(orderToast);
      toast.error(typeof err === 'string' ? err : "Order failed");
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12">

        {/* Header Section */}
        <div className="flex flex-col mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase mb-4">Checkout</h1>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">Address</span>
                </div>
                <div className="w-8 h-[1px] bg-gray-200 shrink-0"></div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Payment</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">

          {/* LEFT: ADDRESS SELECTION (8 Cols on large screens) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Delivery Details</h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center justify-center gap-2 text-xs font-black text-blue-600 bg-blue-50 px-5 py-3 rounded-full hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto"
              >
                {showAddressForm ? <X size={16} /> : <Plus size={16} />} {showAddressForm ? 'CANCEL' : 'ADD NEW ADDRESS'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-white p-6 sm:p-10 rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street / House No.</label>
                    <input required className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                    <input required className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                    <input required className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                    <input required className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3 py-2">
                    <input type="checkbox" id="isDefault" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                    <label htmlFor="isDefault" className="text-xs font-bold text-gray-500 cursor-pointer uppercase">Set as default</label>
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-gray-900 transition-all uppercase shadow-lg shadow-blue-100">Save Address</button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => dispatch(setSelectedAddress(addr))}
                  className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedAddress?._id === addr._id ? 'border-blue-600 bg-white shadow-xl shadow-blue-50' : 'border-gray-50 bg-white hover:border-blue-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${selectedAddress?._id === addr._id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <Home size={18} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); dispatch(deleteAddressAsync(addr._id)); }} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="font-black text-gray-900 text-sm mb-1 uppercase tracking-tight">{addr.street}</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                  {selectedAddress?._id === addr._id && <CheckCircle2 size={20} fill="#2563eb" className="absolute bottom-6 right-6 text-white" />}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY (5 Cols on large screens) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 sticky top-8 border border-gray-50">
              <h2 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest">Order Summary</h2>

              <div className="max-h-[250px] overflow-y-auto pr-2 mb-8 space-y-5 no-scrollbar">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-800 line-clamp-1">{item.productId?.title}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty: {item.quantity}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900 shrink-0">₹{((item.productId?.price?.amount || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500" : "text-gray-900"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between items-end pt-6">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Payable Amount</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className={`w-full mt-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${selectedAddress ? 'bg-blue-600 text-white hover:bg-gray-900 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Secure Payment <ArrowRight size={18} />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-300 text-[9px] font-black uppercase tracking-[0.2em]">
                <CreditCard size={12} className="text-gray-300" /> PCI-DSS Compliant
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;