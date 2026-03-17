import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrdersAsync } from '../features/order/orderSlice';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.order);

  useEffect(() => {
    dispatch(fetchMyOrdersAsync());
  }, [dispatch]);

  // Status mapping for colors and icons
  const statusConfig = {
    PENDING: { color: 'text-orange-500 bg-orange-50', icon: <Clock size={16} /> },
    CONFIRMED: { color: 'text-blue-500 bg-blue-50', icon: <CheckCircle2 size={16} /> },
    SHIPPED: { color: 'text-purple-500 bg-purple-50', icon: <Truck size={16} /> },
    DELIVERED: { color: 'text-green-500 bg-green-50', icon: <CheckCircle2 size={16} /> },
    CANCELLED: { color: 'text-red-500 bg-red-50', icon: <XCircle size={16} /> },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-pulse flex flex-col items-center">
          <Package className="h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase">My Orders</h1>
          <p className="text-gray-400 mt-2 font-medium">Track and manage your recent purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
            <Package className="mx-auto h-16 w-16 text-gray-100 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-4">No orders yet</h2>
            <Link to="/" className="text-blue-600 font-black uppercase tracking-widest text-xs hover:underline">
              Start Shopping <ArrowRight className="inline ml-1" size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all overflow-hidden group">
                <div className="p-6 md:p-10">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg shadow-gray-200">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                        <p className="font-black text-gray-900 tracking-tight text-lg">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${statusConfig[order.status]?.color || 'bg-gray-100'}`}>
                        {statusConfig[order.status]?.icon}
                        {order.status}
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-full font-black text-[10px] text-gray-500 uppercase tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Items list */}
                    <div className="lg:col-span-2 space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                          <div className="flex items-center gap-4">
                            <div className='flex justify-center items-center'>
                              <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100'} className="w-12 h-12 bg-white rounded-xl border border-gray-100 object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{item.product?.title || 'Product'}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-black text-gray-900 text-sm italic">₹{item.price.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Total */}
                    <div className="bg-gray-50 p-8 rounded-[2rem] flex flex-col justify-between">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 text-gray-400">
                          <MapPin size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Shipping To</span>
                        </div>
                        <p className="text-xs font-bold text-gray-600 leading-relaxed">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.pincode}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-3xl font-black text-blue-600 tracking-tighter italic">₹{order.totalPrice.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                    <Link to={`/order/${order._id}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-all group-hover:translate-x-1">
                      Order Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;