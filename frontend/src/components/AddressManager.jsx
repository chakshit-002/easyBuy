import React, { useState } from 'react';
import API from '../api/axios';

const AddressManager = ({ existingAddresses, onAddressAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    street: '', city: '', state: '', pincode: '', country: 'India'
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      // Aapka route: router.post("/users/me/addresses")
      const response = await API.post('/users/me/addresses', formData);
      onAddressAdded(response.data.addresses); // UI update karne ke liye
      setShowForm(false);
      setFormData({ street: '', city: '', state: '', pincode: '', country: 'India' });
    } catch (err) {
      alert("Address add karne mein error aaya!");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
      
      {/* Existing Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {existingAddresses?.map((addr) => (
          <div key={addr._id} className="border-2 border-blue-100 p-4 rounded-xl bg-blue-50 relative">
            <p className="font-semibold text-gray-800">{addr.street}</p>
            <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
            {/* Delete button (Aapke delete route ke liye) */}
            <button className="text-red-500 text-xs mt-2 underline">Remove</button>
          </div>
        ))}
      </div>

      {/* Add New Address Button/Form */}
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-blue-600 font-medium hover:underline">
          + Add New Address
        </button>
      ) : (
        <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <input 
            className="w-full border p-2 rounded" 
            placeholder="Street / House No." 
            onChange={(e) => setFormData({...formData, street: e.target.value})}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              className="border p-2 rounded" 
              placeholder="City" 
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required 
            />
            <input 
              className="border p-2 rounded" 
              placeholder="State" 
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              required 
            />
          </div>
          <input 
            className="w-full border p-2 rounded" 
            placeholder="Zip Code" 
            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            required 
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressManager;