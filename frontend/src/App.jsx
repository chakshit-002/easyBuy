import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import MainRoutes from './Routes/MainRoutes';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import ServiceWaker from './utils/ServiceWaker';


const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. App load hote hi pehli baar jagao
    ServiceWaker();

    // 2. Har 5 minute (300,000 ms) mein dubara ping karo taaki Render unhe sone na de
    const interval = setInterval(() => {
      ServiceWaker();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
      <Footer />
    </div>
  );
}

export default App;