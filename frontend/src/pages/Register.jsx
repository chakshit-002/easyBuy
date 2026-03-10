import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '', role: 'user'
  });

  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // SECURITY & UX: Agar register success ho gaya, toh home par bhejo
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password, // Backend pr jaayega
      fullName: { firstName: formData.firstName, lastName: formData.lastName },
      role: formData.role
    };

    try {
      // unwrap() se hum result ka wait karte hain
      await dispatch(registerUser(payload)).unwrap();

      // Agar success hua tabhi password clear hoga
      setFormData(prev => ({ ...prev, password: '' }));
      console.log("Registration Successful!");
    } catch (err) {
      // Agar error aaya toh password clear nahi hoga 
      // taaki user usey check karke fix kar sake
      console.error("Failed to register: ", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Grid for Names */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Username"
            className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password" // Browser ko password save karne se rokne ke liye
            className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <select
            className="border p-2.5 rounded-lg w-full bg-white"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">I am a Buyer (User)</option>
            <option value="seller">I am a Seller</option>
          </select>

          <button
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Creating Secure Account...' : 'Register'}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm">
              {error}
            </div>
          )}
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?
          <span
            className="text-blue-600 cursor-pointer font-semibold ml-1 hover:underline"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;