import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Plus, CheckCircle2, Trash2, ArrowRight, Home, Briefcase, CreditCard } from 'lucide-react';
import { fetchAddressesAsync, deleteAddressAsync, setSelectedAddress, addAddressAsync } from '../features/address/addressSlice';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentAPI } from '../api/axios'
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addresses, selectedAddress, loading } = useSelector(state => state.address);
  const { items } = useSelector(state => state.cart);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false
  });

  useEffect(() => {
    dispatch(fetchAddressesAsync());
  }, [dispatch]);

  // Calculate Summary
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
      toast.error(err || "Failed to add address");
    }
  };

  const handlePayment = async (orderId) => {
    try {
      // 1. Razorpay Order Create Karo (Payment Service - 3004)
      const res = await paymentAPI.post(`/create/${orderId}`, {}, { withCredentials: true });
      const { payment } = res.data;

      // 2. Razorpay Options Setup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Frontend .env mein rakho
        amount: payment.price.amount,
        currency: payment.price.currency,
        name: "Gemini Store",
        description: "Premium Purchase",
        order_id: payment.razorpayOrderId, // Razorpay wali Order ID
        handler: async (response) => {
          // Ye tab chalega jab payment success hogi
          try {
            const verifyRes = await axios.post(`http://localhost:3004/api/payments/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            }, { withCredentials: true });

            if (verifyRes.status === 200) {
              toast.success("Payment Successful!");
              navigate('/order-success');
            }
          } catch (err) {
            toast.error("Payment Verification Failed");
          }
        },
        prefill: {
          name: "User Name", // Dynamic kar sakte ho
          email: "user@example.com",
        },
        theme: { color: "#2563eb" } // Blue theme
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error("Payment Initiation Failed");
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) return toast.error("Please select a delivery address first!");

    // Logic: Pehle Order Service mein entry dalo
    const orderData = {
      items: items.map(item => ({
        product: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
      })),
      totalPrice: { amount: total, currency: 'INR' },
      shippingAddress: selectedAddress
    };

    try {
      const order = await dispatch(createOrderAsync(orderData)).unwrap();
      // Order ban gaya, ab Payment trigger karo
      handlePayment(order._id);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">

        {/* Progress Header */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-center gap-2 text-blue-600 shrink-0">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</span>
            <span className="font-black tracking-tight">ADDRESS</span>
          </div>
          <div className="h-[2px] w-12 bg-gray-200 shrink-0"></div>
          <div className="flex items-center gap-2 text-gray-400 shrink-0">
            <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">2</span>
            <span className="font-bold tracking-tight">PAYMENT</span>
          </div>
          <div className="h-[2px] w-12 bg-gray-200 shrink-0"></div>
          <div className="flex items-center gap-2 text-gray-400 shrink-0">
            <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">3</span>
            <span className="font-bold tracking-tight">CONFIRM</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">

          {/* LEFT: ADDRESS SELECTION */}
          <div className="flex-[2] space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Delivery Address</h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-2 text-sm font-black text-blue-600 bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-600 hover:text-white transition-all"
              >
                <Plus size={18} /> {showAddressForm ? 'CLOSE' : 'ADD NEW'}
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Street / House No.</label>
                    <input required className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="123, Luxury Apartments" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">City</label>
                    <input required className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="New Delhi" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">State</label>
                    <input
                      required
                      className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Delhi"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Country</label>
                    <input
                      required
                      className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="India"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Pincode</label>
                    <input required className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="110001" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                  </div>

                  {/* isDefault Toggle */}
                  <div className="md:col-span-2 flex items-center gap-3 ml-2 mt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    />
                    <label htmlFor="isDefault" className="text-sm font-bold text-gray-600 cursor-pointer">
                      Set as default delivery address
                    </label>
                  </div>

                </div>
                <button type="submit" className="mt-8 bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-600 transition-all">Save & Continue</button>
              </form>
            )}

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => dispatch(setSelectedAddress(addr))}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group ${selectedAddress?._id === addr._id ? 'border-blue-600 bg-white shadow-xl shadow-blue-100' : 'border-transparent bg-white hover:border-gray-200'}`}
                >
                  {selectedAddress?._id === addr._id && (
                    <div className="absolute top-6 right-6 text-blue-600">
                      <CheckCircle2 fill="currentColor" className="text-white bg-blue-600 rounded-full" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-2xl ${selectedAddress?._id === addr._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Home size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-gray-400">Home Address</span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg leading-snug mb-1">{addr.street}</p>
                  <p className="text-gray-500 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch(deleteAddressAsync(addr._id)); }}
                    className="mt-6 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="flex-1 w-full lg:sticky lg:top-10">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Order Details</h2>

              <div className="space-y-4 mb-8">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-500">{item.productId?.title} <span className="text-gray-300 ml-1">x{item.quantity}</span></span>
                    <span className="text-gray-900">₹{((item.productId?.price?.amount || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-50 mb-10">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-black" : "text-gray-900"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Pay</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className={`w-full py-6 rounded-full font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${selectedAddress ? 'bg-blue-600 text-white hover:bg-gray-900 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Proceed to Payment <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">
                <CreditCard size={14} className="text-gray-400" /> Secure Encryption Enabled
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;