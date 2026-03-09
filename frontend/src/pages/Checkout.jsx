import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addUserAddress } from '../features/auth/authSlice';

const Checkout = () => {
  const { user } = useSelector(state => state.auth);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const dispatch = useDispatch();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Select Shipping Address</h3>
        
        {/* Addresses List */}
        <div className="space-y-3">
          {user?.addresses?.map((addr) => (
            <div 
              key={addr._id}
              onClick={() => setSelectedAddress(addr._id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition ${selectedAddress === addr._id ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
            >
              <p className="font-medium">{user.fullName.firstName} {user.fullName.lastName}</p>
              <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
            </div>
          ))}
        </div>

        {/* Add Address Button */}
        <button 
          onClick={() => setShowAddressForm(!showAddressForm)}
          className="mt-4 text-blue-600 text-sm font-semibold hover:underline">
          {showAddressForm ? '- Cancel' : '+ Add New Address'}
        </button>

        {/* Dynamic Address Form (Responsive) */}
        {showAddressForm && (
          <div className="mt-4 p-4 border rounded-xl bg-gray-50 animate-in fade-in duration-300">
             {/* Form fields here (Street, City, Zip, etc.) */}
             {/* Submit button calls: dispatch(addUserAddress(formData)) */}
             <p className="text-xs text-gray-500">Form fields go here...</p>
          </div>
        )}
      </div>

      {/* Order Summary Button */}
      <button className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300"
        disabled={!selectedAddress}>
        Proceed to Payment
      </button>
    </div>
  );
};

export default Checkout;