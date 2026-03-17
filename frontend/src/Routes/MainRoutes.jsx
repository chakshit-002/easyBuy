import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import Checkout from '../pages/Checkout';
import ProtectedRoute from './ProtectedRoute';
import ProductPage from '../pages/ProductPage';
import OrderDetails from '../pages/OrderDetails';

const MainRoutes = () => {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (Sabke liye open) --- */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<ProductPage />} />

      {/* --- PROTECTED ROUTES (Sirf Login ke baad) --- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/orders" element={<Orders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        {/* Aapka AI Buddy dashboard bhi yahan aa sakta hai */}
      </Route>

      {/* 404 Page (Optional) */}
      <Route path="*" element={<div className="text-center mt-20">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default MainRoutes;