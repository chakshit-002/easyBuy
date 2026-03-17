
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../api/axios';
import { Package, MapPin, CreditCard, ChevronLeft, Trash2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [updatedAddress, setUpdatedAddress] = useState({}); // Pre-fill with order.shippingAddress

    const fetchOrderDetails = async () => {
        try {
            const res = await orderAPI.get(`/${id}`);
            setOrder(res.data.order);
        } catch (err) {
            toast.error("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrderDetails(); }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await orderAPI.post(`/${id}/cancel`);
            toast.success("Order Cancelled");
            fetchOrderDetails(); // Refresh data
        } catch (err) {
            toast.error("Cancellation failed");
        }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        const updateToast = toast.loading("Updating Address...");
        try {
            await orderAPI.patch(`/${id}/address`, { shippingAddress: updatedAddress });
            toast.success("Address Updated!", { id: updateToast });
            setIsEditingAddress(false);
            fetchOrderDetails(); // Data refresh karo
        } catch (err) {
            toast.error("Failed to update address", { id: updateToast });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Fetching Order Details...</p>
        </div>
    );

    if (!order) return <div className="p-20 text-center font-black">ORDER NOT FOUND</div>;

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-20">
            <div className="max-w-[1100px] mx-auto px-6 py-12">

                <Link to='/orders' className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-black mb-10 uppercase tracking-[0.2em] transition-all">
                    <ChevronLeft size={16} /> Back to History
                </Link>

                <div className="bg-white rounded-[3.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/40">

                    {/* Invoice Header */}
                    <div className="p-8 md:p-12 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-50">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm ${order.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-blue-600 text-white shadow-blue-100'}`}>
                                    {order.status}
                                </span>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{new Date(order.createdAt).toDateString()}</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Order #{order._id.slice(-8)}</h1>
                        </div>

                        {order.status === 'PENDING' && (
                            <button onClick={handleCancelOrder} className="flex items-center gap-2 bg-white text-red-500 border border-red-100 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-50">
                                <Trash2 size={14} /> Cancel Order
                            </button>
                        )}
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Items Section */}
                        <div className="mb-16">
                            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Purchased Products</h3>
                            <div className="grid gap-6">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50/30 border border-gray-50 group hover:border-blue-100 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border border-gray-100 p-1 flex-shrink-0">
                                                <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100'} className="w-full h-full object-cover rounded-xl mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 text-lg tracking-tight leading-tight">{item.product?.title || "Product Title"}</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="text-xl font-black text-gray-900 italic tracking-tighter">₹{item.price.amount.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Address Card with Edit Logic */}
                            <div className="p-8 md:p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 relative group overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Shipping Destination</span>
                                        </div>
                                        {order.status === 'PENDING' && !isEditingAddress && (
                                            <button
                                                onClick={() => {
                                                    setUpdatedAddress(order.shippingAddress);
                                                    setIsEditingAddress(true);
                                                }}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {isEditingAddress ? (
                                        <form onSubmit={handleUpdateAddress} className="space-y-3 animate-in fade-in duration-300">
                                            <input
                                                className="w-full p-3 text-xs rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                                                value={updatedAddress.street}
                                                onChange={(e) => setUpdatedAddress({ ...updatedAddress, street: e.target.value })}
                                                placeholder="Street"
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    className="p-3 text-xs rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                                                    value={updatedAddress.city}
                                                    onChange={(e) => setUpdatedAddress({ ...updatedAddress, city: e.target.value })}
                                                    placeholder="City"
                                                />
                                                <input
                                                    className="p-3 text-xs rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                                                    value={updatedAddress.pincode}
                                                    onChange={(e) => setUpdatedAddress({ ...updatedAddress, pincode: e.target.value })}
                                                    placeholder="Pincode"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase">Save</button>
                                                <button type="button" onClick={() => setIsEditingAddress(false)} className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg font-black text-[10px] uppercase">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase italic">
                                            {order.shippingAddress.street}<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Total Bill Card */}
                            <div className="p-10 rounded-[2.5rem] bg-gray-900 text-white shadow-2xl shadow-gray-200">
                                <div className="flex items-center gap-2 mb-8 text-gray-500">
                                    <CreditCard size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Billing Summary</span>
                                </div>
                                <div className="space-y-4 border-b border-white/5 pb-8 mb-8">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="text-white">₹{order.totalPrice.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Shipping</span>
                                        <span className="text-green-400">FREE</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Pay</span>
                                    <span className="text-5xl font-black italic tracking-tighter leading-none">₹{order.totalPrice.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row items-center justify-center gap-6 text-gray-300 text-[9px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500" /> Secure Certified</div>
                        <div className="flex items-center gap-2"><AlertCircle size={14} className="text-blue-500" /> Track Parcel 24/7</div>
                    </div>
                </div>
            </div>



        </div>
    );
};

export default OrderDetails;