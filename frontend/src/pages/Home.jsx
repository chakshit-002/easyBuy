// pages/Home.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productSlice';
import HomeBanner from '../components/HomeBanner';
import { EyeIcon } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);
  console.log("Home itmes ", items);
  console.log("Home loading ", loading);
  useEffect(() => {
    // Sirf 10 products mangwao total filter karne ke liye
    dispatch(fetchProducts({ limit: 11 }));
  }, [dispatch]);

  // Logic: 
  const bannerProduct1 = items[0]; // Pehla product pehle banner ke liye
  const bannerProduct2 = items[1]; // Doosra product doosre banner ke liye
  const gridProducts = items.slice(2, 6); // Niche ke liye sirf 4 products (index 2 se 6)
  const gridProducts2 = items.slice(7, 11);
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">

      {/* 1st BIG BANNER */}
      {!loading && bannerProduct1 && (
        <HomeBanner
          product={bannerProduct1}
          bgColor="bg-blue-100"
          title="The Next Gen Smart Device"
        />
      )}

      {/* MINI SECTION: CHUNINDA PRODUCTS */}
      <div className="my-16  ">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-3xl font-bold">Top Picks for You</h3>
            <p className="text-gray-500 mt-2">Handpicked quality products just for your style.</p>
          </div>
          <Link to='/products' className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hidden sm:block ">See All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {gridProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className='flex justify-center'>
          <Link to='/products' className="inline-block text-blue-600 font-bold border-b-2  border-blue-600 pb-1 sm:hidden  text-center mt-10 ">See All</Link>
        </div>
      </div>

      {/* 2nd BANNER (Thoda alag style) */}
      {!loading && bannerProduct2 && (
        <HomeBanner
          product={bannerProduct2}
          bgColor="bg-orange-100"
          title="Limited Edition Essentials"
        />
      )}

      {/* EK AUR KYA KR SKTE HAI: "TRUST SECTION" */}
      <div className="flex gap-20 sm:gap-50 py-12 border-t border-gray-100 mt-20 justify-center items-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🚚</div>
          <h4 className="font-bold">Fast Delivery</h4>
          <p className="text-xs text-gray-500">Within 24-48 Hours</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <h4 className="font-bold">Secure Payment</h4>
          <p className="text-xs text-gray-500">100% Safe Checkout</p>
        </div>
        {/* Aise hi 2 aur daal sakte ho */}
      </div>

      <div className="my-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-3xl font-bold">Our Collections</h3>
            <p className="text-gray-500 mt-2">Handpicked quality products just for your style.</p>
          </div>
          <Link to='/products' className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hidden sm:block">See All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {gridProducts2.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className='flex justify-center'>
          <Link to='/products' className="inline-block text-blue-600 font-bold border-b-2  border-blue-600 pb-1 sm:hidden  text-center mt-10 ">See All</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;