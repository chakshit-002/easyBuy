import React from 'react';
import { LogOut, AlertCircle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay: Piche ka background blur karne ke liye */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 transform animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900">Oh no! Leaving?</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Are you sure you want to log out? You'll need to sign in again to access your cart and orders.
          </p>

          <div className="flex flex-col w-full gap-3 mt-8">
            <button
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-100"
            >
              <LogOut className="h-4 w-4" /> Yes, Log Me Out
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;