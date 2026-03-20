import React from 'react';

const Hero = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[500px] bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-between px-10 md:px-20 text-white z-10 bg-black/30">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Upto 50% Off on Latest Tech!</h1>
          <p className="text-lg md:text-xl mb-6">Upgrade your lifestyle with the best gadgets in the market.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">
            Shop Now
          </button>
        </div>
      </div>
      <img 
        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070" 
        alt="Banner" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Hero;