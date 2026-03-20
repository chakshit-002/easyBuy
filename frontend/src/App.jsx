import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import MainRoutes from './Routes/MainRoutes';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';


const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Page load hote hi backend se 'me' wala route hit hoga
    // Cookies automatically chali jayengi 'withCredentials: true' ki wajah se
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ScrollToTop />
      <Navbar />
      <MainRoutes />
      <Footer/>
    </div>
  );
}

export default App;