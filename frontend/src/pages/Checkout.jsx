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
        name: "easyBuy Store",
        description: "Premium Purchase",
        order_id: payment.razorpayOrderId,
        handler: async (response) => {
          const verifyToast = toast.loading("Verifying Transaction...");
          try {
            const verifyRes = await paymentAPI.post(`/verify`, {
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
                  <span className="text-[10px] w-1/2 sm:w-full font-black text-gray-300 uppercase tracking-[0.2em]">Payable Amount</span>
                  <span className="text-xl sm:text-4xl font-black text-blue-600 tracking-tighter">₹{total.toLocaleString()}</span>
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