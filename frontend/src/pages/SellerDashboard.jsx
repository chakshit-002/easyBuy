import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerMetrics, fetchMyProducts } from '../features/seller/sellerSlice';
import { Package, IndianRupee, ShoppingCart, TrendingUp, Box } from 'lucide-react';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  // Redux state se metrics aur products nikalna
  const { metrics, myProducts, loading } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerMetrics());
    dispatch(fetchMyProducts());
  }, [dispatch]);
  console.log("REDUX METRICS:", metrics);
  console.log("REDUX PRODUCTS:", myProducts);
  // Loading State
  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <p className="text-gray-400 font-black italic uppercase tracking-widest text-xs">Loading Seller Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Business Overview</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Seller Control Panel</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">Live Inventory</p>
          <p className="text-xl font-black italic text-blue-600">{myProducts?.length || 0} Items</p>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
            <h2 className="text-2xl font-black italic text-gray-800">₹{metrics?.revenue?.toLocaleString('en-IN') || 0}</h2>
          </div>
        </div>

        {/* Sales Card (Total Items Sold) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
            <ShoppingCart size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Sold</p>
            <h2 className="text-2xl font-black italic text-gray-800">{metrics?.sales || 0} Units</h2>
          </div>
        </div>

        {/* Top Product Quick View */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Product</p>
            <h2 className="text-sm font-black italic text-gray-800 truncate w-32">
              {metrics?.topProducts?.[0]?.title || "No Sales Yet"}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- RECENT PRODUCTS LIST --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase italic tracking-tight text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-blue-500" /> My Inventory
            </h3>
            
          </div>

          <div className="space-y-4  overflow-y-auto max-h-[400px]">
            {myProducts?.length > 0 ? (
              myProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden">
                      <img src={product?.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic text-gray-800 line-clamp-1">{product.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">₹{product.price?.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
                      Qty: {product?.stock || 0}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-gray-400 text-xs italic font-bold">No products found.</p>
            )}
          </div>
        </div>

        {/* --- TOP PERFORMING PRODUCTS --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase italic tracking-tight text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" /> Best Sellers
            </h3>
          </div>

          {metrics?.topProducts?.length > 0 ? (
            <div className="space-y-6 overflow-y-auto max-h-[400px]">
              {metrics.topProducts.map((item, index) => (
                <div key={item.id} className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black italic text-[#484646] ">0{index + 1}</span>
                    <div className="">
                      <h4 className="text-sm font-black italic text-gray-800">{item.title}</h4>
                      <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min((item.sold / (metrics.sales || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-black italic text-gray-500">{item.sold} Sold</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10">
              <Box size={40} className="text-gray-100 mb-2" />
              <p className="text-[10px] font-black text-gray-300 uppercase italic">Analyze Data Pending...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;