import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  User, Mail, MapPin, LogOut, ChevronRight,
  Shield, CreditCard, Box, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import { fetchAddressesAsync } from '../features/address/addressSlice';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { addresses } = useSelector(state => state.address);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();

  const confirmLogout = () => {
    dispatch(logoutUser());
    setShowLogoutModal(false);
    navigate('/login');
  };

  // Initial letter for Avatar
  const initial = user?.username?.charAt(0) || 'U';

  useEffect(() => {
    // Agar addresses array khali hai, toh hi fetch karo
    if (addresses.length === 0) {
      dispatch(fetchAddressesAsync());
    }
  }, [dispatch, addresses.length]);


  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-md min-[350px]:text-xl min-[450px]:text-4xl font-black text-gray-900 tracking-tighter italic uppercase">My Account</h1>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center cursor-pointer gap-2 bg-red-50 text-red-500 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* --- LEFT: USER INFO CARD --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[3rem] px-4 py-10 min-[450px]:p-10 shadow-2xl shadow-gray-200/50 border border-gray-50 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black italic shadow-2xl shadow-blue-200 mb-6 border-8 border-white">
                {initial.toUpperCase()}
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user?.username}</h2>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">{user?.role || 'Verified Customer'}</p>
              </div>

              <div className="w-full mt-10 pt-10 border-t border-gray-50 space-y-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Email Address</p>
                    <p className="text-xs min-[380px]:text-sm font-bold text-gray-700 break-all">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Status</p>
                    <p className="text-sm font-bold text-green-500 uppercase">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ADDRESSES & QUICK LINKS --- */}
          <div className="lg:col-span-2 space-y-8">

            {/* Address Section */}
            <div className="bg-white rounded-[3rem] px-4 py-10  min-[450px]:p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-100/50">
              <div className="flex justify-between items-center mb-8">
                <h3 className="w-1/2  min-[450px]:w-full text-sm  min-[450px]:text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" /> Saved Addresses
                </h3>
                <button
                  onClick={() => navigate('/checkout')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  Edit / Manage <ExternalLink size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses && addresses.length > 0 ? (
                  addresses.map((addr, idx) => (
                    <div key={idx} className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 group hover:border-blue-200 transition-all">
                      <p className="font-black text-gray-900 text-sm uppercase tracking-tight mb-1">{addr.street}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm font-bold italic py-4">No addresses saved yet.</p>
                )}
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => navigate('/orders')} className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center justify-between hover:bg-gray-900 hover:text-white transition-all group">
                <div className="flex items-center gap-4">
                  <Box size={20} className="text-blue-600 group-hover:text-blue-400" />
                  <span className="font-black text-[10px] uppercase tracking-widest">My Orders</span>
                </div>
                <ChevronRight size={16} />
              </button>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center justify-between opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <CreditCard size={20} className="text-gray-400" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Payment Methods</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- LOGOUT MODAL POPUP --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Wait! Logout?</h3>
              <p className="text-gray-400 text-sm font-medium mb-8 uppercase tracking-tighter">Are you sure you want to end your session?</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmLogout}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-100 cursor-pointer"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-[10px] cursor-pointer uppercase tracking-widest hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;