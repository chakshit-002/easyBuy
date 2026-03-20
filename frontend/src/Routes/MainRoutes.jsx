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
import ProfileSettings from '../pages/ProfileSettings';
import EasyBuyAI from '../pages/EasyBuyAI';
import SellerDashboard from '../pages/SellerDashboard';
import CreateProduct from '../pages/CreateProduct';
import PageNotFound from '../pages/PageNotFound';


const MainRoutes = () => {
  return (
    <Routes>
    {/* jab bhi Link  se dusre page pr jaege toh top pr hi aege scroll krke upper jane ki jrurt nahi   */}
      
      {/* --- PUBLIC ROUTES (Sabke liye open) --- */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<ProductPage />} />

      {/* --- PROTECTED ROUTES (Sirf Login ke baad) --- */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'seller']} />}>
        <Route path="/orders" element={<Orders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/ai-buddy" element={<EasyBuyAI />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/create-product" element={<CreateProduct />} />
      </Route>

      {/* 404 Page (Optional) */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default MainRoutes;