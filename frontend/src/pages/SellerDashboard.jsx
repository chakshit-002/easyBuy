import React from 'react';
import { useSelector } from 'react-redux';
import { Package, ShoppingBag, DollarSign, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  // Stats Data (Inhe aap baad mein fetchMyProducts/Orders slice se connect kar sakte hain)
  const stats = [
    { label: 'Active Products', value: '12', icon: <Package size={24}/>, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: '05', icon: <ShoppingBag size={24}/>, color: 'bg-orange-500' },
    { label: 'Total Revenue', value: '₹45,280', icon: <DollarSign size={24}/>, color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Seller Central</h1>
          <p className="text-gray-500 font-medium">Welcome back, {user?.fullName}!</p>
        </div>
        <button 
          onClick={() => navigate('/seller/add-product')}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-gray-200"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={`${stat.color} text-white p-4 rounded-2xl shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Recent Orders */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">Recent Orders</h3>
            <button onClick={() => navigate('/seller/orders')} className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline flex items-center">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="text-center py-10 text-gray-400 font-medium">
             Orders list will appear here...
          </div>
        </div>

        {/* Placeholder for Product Performance */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight italic mb-6">Top Selling</h3>
          <div className="text-center py-10 text-gray-400 font-medium">
             Inventory insights coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;